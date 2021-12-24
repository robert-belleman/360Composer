Dit document bevat instructies voor het maken van aanpassingen aan de applicatie.

# Aanpassingen maken aan de applicatie

## Aanpassingen aan de database
Om een aanpassing te maken aan de database van de applicatie kan het volgende stappenplan worden opgevolgd:
1. Open de terminal en ga naar de scene-editor/backend/migrations map.
2. Maak een nieuwe migratie aan door `alembic revision -m ``een revision titel''' te runnen.
3. Voeg in het nieuw aangemaakte bestand in scene-editor/backend/migrations/versions de veranderingen toe die gemaakt moeten worden aan de database. Hiervoor kan het handig zijn om te kijken naar de andere bestanden in dezelfde map, omdat de migratie files vaak dezelfde structuur hebben.
4. Pas vervolgens in de map scene-editor/backend/app/schemas het schema aan van de tabel die aangepast is. Doe hetzelfde voor het model in de map scene-editor/backend/app/models.
5. Om eventuele functionaliteit te verbinden aan het aangepaste stuk van de database kunnen in de map scene-editor/backend/app/routes in de corresponderende file aanpassingen worden gemaakt aan de API.


# Aanpassingen aan de frontend
Als er een aanpassing gemaakt moet worden aan een van de pagina's van de frontend van de scene editor moet er gekeken worden naar de map scene-editor/frontend/src.

# Aanpassingen aan de player
Om bij de rotatie van de camera te komen, moet het camera component worden opgehaald. Dit kan door een id eraan toe te voegen. Vervolgens kan dan met het commando
```javascript
const camera = document.getElementById('camera')
```
de camera worden opgehaald en de rotatie worden gelezen met
```javascript
const rotation = camera.getAttribute('rotation')
```
Zo kunnen ook andere attributen worden opgehaald van andere componenten.
