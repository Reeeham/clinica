FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Clinica.Domain/Clinica.Domain.csproj src/Clinica.Domain/
COPY src/Clinica.Application/Clinica.Application.csproj src/Clinica.Application/
COPY src/Clinica.Infrastructure/Clinica.Infrastructure.csproj src/Clinica.Infrastructure/
COPY src/Clinica.Api/Clinica.Api.csproj src/Clinica.Api/
RUN dotnet restore src/Clinica.Api/Clinica.Api.csproj

COPY . .
RUN dotnet publish src/Clinica.Api/Clinica.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Clinica.Api.dll"]
