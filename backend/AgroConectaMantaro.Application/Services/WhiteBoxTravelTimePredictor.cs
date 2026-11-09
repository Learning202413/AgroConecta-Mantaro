using System.Globalization;
using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;

namespace AgroConectaMantaro.Application.Services;

/// <summary>
/// White-box Multiple Linear Regression model for freight travel time estimation across Junin.
/// Implements Ordinary Least Squares (OLS) closed-form matrix solution: beta = (X^T * X)^(-1) * X^T * y
/// Trained on authentic Peruvian freight transit datasets across the Mantaro Valley
/// (data/dataset_transporte_mantaro.csv) calibrated with MTC D.S. N.° 020-2021-MTC.
/// </summary>
public class WhiteBoxTravelTimePredictor : ITravelTimePredictor
{
    private readonly double _beta0; // Intercept (Baseline dispatch / maneuvering in minutes)
    private readonly double _beta1; // Distance coefficient (minutes per km)
    private readonly double _beta2; // Weight coefficient (minutes per metric ton)
    private readonly double _beta3; // Rush hour coefficient (minutes penalty during peak traffic)

    private readonly double _rSquared;
    private readonly double _mse;
    private readonly int _sampleSize;
    private readonly RegressionAuditDto _audit;

    public WhiteBoxTravelTimePredictor()
    {
        // Load training dataset from CSV or fallback to standard calibration
        var observations = LoadTrainingData();

        _sampleSize = observations.Count;
        int p = 4; // Beta0, Beta1, Beta2, Beta3

        // Build Design Matrix X (n x p) and Target Vector y (n x 1)
        double[,] X = new double[_sampleSize, p];
        double[] y = new double[_sampleSize];

        for (int i = 0; i < _sampleSize; i++)
        {
            X[i, 0] = 1.0;
            X[i, 1] = observations[i].DistKm;
            X[i, 2] = observations[i].WeightTons;
            X[i, 3] = observations[i].IsRushHour;
            y[i] = observations[i].ActualMinutes;
        }

        // Compute X^T * X (4x4 matrix) and X^T * y (4x1 vector)
        double[,] XtX = new double[p, p];
        double[] Xty = new double[p];

        for (int i = 0; i < p; i++)
        {
            for (int j = 0; j < p; j++)
            {
                double sum = 0;
                for (int k = 0; k < _sampleSize; k++)
                {
                    sum += X[k, i] * X[k, j];
                }
                XtX[i, j] = sum;
            }

            double sumY = 0;
            for (int k = 0; k < _sampleSize; k++)
            {
                sumY += X[k, i] * y[k];
            }
            Xty[i] = sumY;
        }

        // Solve XtX * beta = Xty using Gaussian elimination with partial pivoting (OLS analytic solution)
        double[] beta = SolveLinearSystem(XtX, Xty, p);

        _beta0 = beta[0];
        _beta1 = beta[1];
        _beta2 = beta[2];
        _beta3 = beta[3];

        // Model goodness of fit (R^2 and MSE)
        double yMean = y.Average();
        double ssTot = 0;
        double ssRes = 0;

        for (int i = 0; i < _sampleSize; i++)
        {
            double yPred = _beta0 + _beta1 * X[i, 1] + _beta2 * X[i, 2] + _beta3 * X[i, 3];
            ssRes += Math.Pow(y[i] - yPred, 2);
            ssTot += Math.Pow(y[i] - yMean, 2);
        }

        _rSquared = 1.0 - (ssRes / ssTot);
        _mse = ssRes / _sampleSize;

        _audit = new RegressionAuditDto
        {
            Formula = $"T_viaje = {_beta0:F2} + {_beta1:F2}*Dist(km) + {_beta2:F2}*Carga(t) + {_beta3:F2}*HoraPunta",
            RSquared = Math.Round(_rSquared, 4),
            MeanSquaredError = Math.Round(_mse, 2),
            InterceptBeta0 = Math.Round(_beta0, 4),
            DistanceBeta1 = Math.Round(_beta1, 4),
            WeightBeta2 = Math.Round(_beta2, 4),
            RushHourBeta3 = Math.Round(_beta3, 4),
            SampleSize = _sampleSize,
            Interpretation = $"Modelo OLS entrenado con {_sampleSize} registros de transporte en el Valle del Mantaro. " +
                             $"Explica el {Math.Round(_rSquared * 100, 1)}% de la varianza en tiempos de viaje (R²={_rSquared:F3}, MSE={_mse:F2} min). " +
                             $"Cada km añade ~{_beta1:F2} min; cada tonelada de carga reduce velocidad y añade ~{_beta2:F2} min en pendientes; la hora punta en El Tambo/Huancayo añade ~{_beta3:F1} min."
        };
    }

    public TravelTimePredictionResult PredictTravelTime(double distanceKm, decimal weightKg, bool isRushHour, int numberOfStops = 1)
    {
        double weightTons = (double)weightKg / 1000.0;
        double rushHourVal = isRushHour ? 1.0 : 0.0;

        // Base pure road driving time (distance + intercept)
        double baseDriving = Math.Max(5.0, _beta0 + (_beta1 * distanceKm));

        // Impact of heavy truck payload on Andean slopes (e.g. Carretera Central, Margen Derecha)
        double weightImpact = Math.Max(0.0, _beta2 * weightTons);

        // Urban bottleneck delay entering Huancayo (El Tambo / Mariscal Castilla / Puquio)
        double rushHourImpact = isRushHour ? _beta3 : 0.0;

        // Agricultural stowage time: ~12 minutes per farm pickup stop
        double stowageLoading = Math.Max(0, numberOfStops * 12);

        double totalMinutes = baseDriving + weightImpact + rushHourImpact + stowageLoading;

        return new TravelTimePredictionResult
        {
            EstimatedTotalMinutes = (int)Math.Round(totalMinutes),
            BaseDrivingMinutes = (int)Math.Round(baseDriving),
            WeightImpactMinutes = (int)Math.Round(weightImpact),
            RushHourImpactMinutes = (int)Math.Round(rushHourImpact),
            StowageLoadingMinutes = (int)Math.Round(stowageLoading),
            Audit = _audit
        };
    }

    public RegressionAuditDto GetRegressionAudit() => _audit;

    private static List<(double DistKm, double WeightTons, double IsRushHour, double ActualMinutes)> LoadTrainingData()
    {
        var potentialPaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data", "dataset_transporte_mantaro.csv"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "data", "dataset_transporte_mantaro.csv"),
            Path.Combine(Directory.GetCurrentDirectory(), "data", "dataset_transporte_mantaro.csv"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "data", "dataset_transporte_mantaro.csv")
        };

        foreach (var path in potentialPaths)
        {
            try
            {
                if (File.Exists(path))
                {
                    var list = new List<(double, double, double, double)>();
                    var lines = File.ReadAllLines(path);
                    for (int i = 1; i < lines.Length; i++)
                    {
                        var line = lines[i].Trim();
                        if (string.IsNullOrEmpty(line)) continue;
                        var parts = line.Split(',');
                        if (parts.Length >= 14 &&
                            double.TryParse(parts[5], NumberStyles.Any, CultureInfo.InvariantCulture, out double dist) &&
                            double.TryParse(parts[6], NumberStyles.Any, CultureInfo.InvariantCulture, out double weight) &&
                            double.TryParse(parts[8], NumberStyles.Any, CultureInfo.InvariantCulture, out double rush) &&
                            double.TryParse(parts[13], NumberStyles.Any, CultureInfo.InvariantCulture, out double time))
                        {
                            list.Add((dist, weight, rush, time));
                        }
                    }

                    if (list.Count >= 20) return list;
                }
            }
            catch
            {
                // Ignore file read issues and fall through to embedded defaults
            }
        }

        return GetDefaultObservations();
    }

    private static List<(double DistKm, double WeightTons, double IsRushHour, double ActualMinutes)> GetDefaultObservations()
    {
        return new List<(double, double, double, double)>
        {
            (45.2, 1.5, 0.0, 64.0),
            (45.2, 4.5, 0.0, 72.0),
            (45.2, 3.0, 1.0, 86.0),
            (45.2, 5.0, 1.0, 92.0),
            (22.1, 1.0, 0.0, 34.0),
            (22.1, 3.5, 0.0, 40.0),
            (22.1, 2.0, 1.0, 49.0),
            (22.1, 4.0, 1.0, 54.0),
            (16.4, 1.2, 0.0, 26.0),
            (16.4, 3.0, 0.0, 30.0),
            (16.4, 2.5, 1.0, 42.0),
            (12.3, 1.0, 0.0, 20.0),
            (12.3, 4.0, 0.0, 26.0),
            (12.3, 2.0, 1.0, 34.0),
            (12.3, 5.0, 1.0, 41.0),
            (9.8, 1.0, 0.0, 17.0),
            (9.8, 3.5, 0.0, 22.0),
            (9.8, 2.0, 1.0, 30.0),
            (9.8, 4.5, 1.0, 36.0),
            (6.2, 1.0, 0.0, 12.0),
            (6.2, 3.0, 0.0, 16.0),
            (6.2, 2.0, 1.0, 24.0),
            (14.5, 2.0, 0.0, 24.0),
            (14.5, 4.0, 1.0, 38.0),
            (28.5, 2.5, 0.0, 44.0),
            (28.5, 4.0, 1.0, 62.0),
            (35.0, 3.0, 0.0, 52.0),
            (35.0, 5.0, 1.0, 74.0)
        };
    }

    /// <summary>
    /// Solves A * x = b for an n x n linear system using Gaussian Elimination with partial pivoting.
    /// </summary>
    private static double[] SolveLinearSystem(double[,] A, double[] b, int n)
    {
        double[,] M = new double[n, n + 1];
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                M[i, j] = A[i, j];
            }
            M[i, n] = b[i];
        }

        for (int k = 0; k < n; k++)
        {
            int maxRow = k;
            double maxVal = Math.Abs(M[k, k]);
            for (int i = k + 1; i < n; i++)
            {
                if (Math.Abs(M[i, k]) > maxVal)
                {
                    maxVal = Math.Abs(M[i, k]);
                    maxRow = i;
                }
            }

            if (maxRow != k)
            {
                for (int j = k; j <= n; j++)
                {
                    (M[k, j], M[maxRow, j]) = (M[maxRow, j], M[k, j]);
                }
            }

            if (Math.Abs(M[k, k]) < 1e-12)
            {
                throw new InvalidOperationException("Matrix is singular or near-singular in OLS regression.");
            }

            for (int i = k + 1; i < n; i++)
            {
                double factor = M[i, k] / M[k, k];
                for (int j = k; j <= n; j++)
                {
                    M[i, j] -= factor * M[k, j];
                }
            }
        }

        double[] x = new double[n];
        for (int i = n - 1; i >= 0; i--)
        {
            double sum = M[i, n];
            for (int j = i + 1; j < n; j++)
            {
                sum -= M[i, j] * x[j];
            }
            x[i] = sum / M[i, i];
        }

        return x;
    }
}
