const TILE_SIZE = 256;

export type Coordinates = {
  lat: number;
  lng: number;
};

export type MapTile = {
  key: string;
  src: string;
  left: number;
  top: number;
};

function scaleForZoom(zoom: number) {
  return TILE_SIZE * 2 ** zoom;
}

export function latLngToWorld({ lat, lng }: Coordinates, zoom: number) {
  const scale = scaleForZoom(zoom);
  const clampedLat = Math.max(Math.min(lat, 85.05112878), -85.05112878);
  const sin = Math.sin((clampedLat * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

export function worldToLatLng(x: number, y: number, zoom: number): Coordinates {
  const scale = scaleForZoom(zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));

  return { lat, lng };
}

export function buildTileGrid({
  apiKey,
  center,
  zoom,
  width,
  height
}: {
  apiKey: string;
  center: Coordinates;
  zoom: number;
  width: number;
  height: number;
}): MapTile[] {
  const centerWorld = latLngToWorld(center, zoom);
  const startX = centerWorld.x - width / 2;
  const startY = centerWorld.y - height / 2;
  const endX = centerWorld.x + width / 2;
  const endY = centerWorld.y + height / 2;
  const minTileX = Math.floor(startX / TILE_SIZE);
  const maxTileX = Math.floor(endX / TILE_SIZE);
  const minTileY = Math.floor(startY / TILE_SIZE);
  const maxTileY = Math.floor(endY / TILE_SIZE);
  const tileCount = 2 ** zoom;
  const tiles: MapTile[] = [];

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      if (tileY < 0 || tileY >= tileCount) continue;
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;

      tiles.push({
        key: `${zoom}-${wrappedX}-${tileY}-${tileX}`,
        src: `https://maps.geoapify.com/v1/tile/osm-bright/${zoom}/${wrappedX}/${tileY}.png?apiKey=${encodeURIComponent(apiKey)}`,
        left: tileX * TILE_SIZE - startX,
        top: tileY * TILE_SIZE - startY
      });
    }
  }

  return tiles;
}
