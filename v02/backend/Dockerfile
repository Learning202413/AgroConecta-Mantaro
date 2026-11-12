# =============================================================================
# Multi-stage Dockerfile for MantaroFrostAlert.API (.NET 8 SDK / Alpine)
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project files for layer caching during restore
COPY ["MantaroFrostAlert.Domain/MantaroFrostAlert.Domain.csproj", "MantaroFrostAlert.Domain/"]
COPY ["MantaroFrostAlert.Application/MantaroFrostAlert.Application.csproj", "MantaroFrostAlert.Application/"]
COPY ["MantaroFrostAlert.Infrastructure/MantaroFrostAlert.Infrastructure.csproj", "MantaroFrostAlert.Infrastructure/"]
COPY ["MantaroFrostAlert.API/MantaroFrostAlert.API.csproj", "MantaroFrostAlert.API/"]

RUN dotnet restore "MantaroFrostAlert.API/MantaroFrostAlert.API.csproj"

# Copy source and publish
COPY . .
RUN dotnet publish "MantaroFrostAlert.API/MantaroFrostAlert.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# =============================================================================
# Runtime stage
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000 \
    DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 5000

USER $APP_UID

ENTRYPOINT ["dotnet", "MantaroFrostAlert.API.dll"]
