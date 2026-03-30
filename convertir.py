import geopandas as gpd
import json

gdf = gpd.read_file("08mun.shp")
print("Columnas:", gdf.columns.tolist())
print("Registros:", len(gdf))
print(gdf[['CVE_MUN','NOMGEO']].head(5) if 'CVE_MUN' in gdf.columns else gdf.head(5))

gdf = gdf.to_crs(epsg=4326)
gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.005, preserve_topology=True)

cols = [c for c in ['CVE_MUN','NOMGEO','geometry'] if c in gdf.columns]
gdf_out = gdf[cols].copy()

geojson_str = gdf_out.to_json()

with open("chihuahua_muns.geojson", "w", encoding="utf-8") as f:
    f.write(geojson_str)

print(f"\nListo — {len(gdf_out)} municipios exportados")
print(f"Tamaño: {len(geojson_str)/1024:.0f} KB")