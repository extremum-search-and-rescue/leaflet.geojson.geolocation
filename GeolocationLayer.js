var L;
(function (L) {
    class GeolocationMarker extends L.CircleMarker {
        _loadImage(name) {
            const iconClassName = name || this.options.iconClassName;
            if (ImageCache[iconClassName])
                return;
            ImageCache[iconClassName] = new Image(18, 18);
            const svgIconLast = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="#FF9200" stroke="#fff" d="M9.233 13.557 9 13.435l-.233.122-3.805 2.001.727-4.237.044-.26-.188-.183-3.079-3.001 4.255-.618.26-.038.116-.236L9 3.13l1.903 3.855.116.236.26.038 4.255.618-3.079 3.001-.188.184.044.259.727 4.237-3.805-2Z"/></svg>`;
            const svgIconOther = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"><path fill="#0094FF" stroke="#fff" d="M9.233 13.557 9 13.435l-.233.122-3.805 2.001.727-4.237.044-.26-.188-.183-3.079-3.001 4.255-.618.26-.038.116-.236L9 3.13l1.903 3.855.116.236.26.038 4.255.618-3.079 3.001-.188.184.044.259.727 4.237-3.805-2Z"/></svg>`;
            let blob = new Blob([iconClassName === 'gis-geo-last' ? svgIconLast : svgIconOther], { type: "image/svg+xml" });
            ImageCache[iconClassName].src = URL.createObjectURL(blob);
            ImageCache[iconClassName].onload = function () {
                URL.revokeObjectURL(ImageCache[iconClassName].src);
            };
        }
        onAdd(map) {
            super.onAdd(map);
            this._map = map;
            this._loadImage(this.options.iconClassName);
            return this;
        }
        getRadius() {
            return this._radius;
        }
        _updatePath() {
            if (!this._map)
                return;
            if (!this._renderer._bounds.intersects(this._pxBounds))
                return;
            const iconClassName = this.options.iconClassName;
            const icon = ImageCache[iconClassName];
            if (!icon)
                return;
            const zoom = this._map.getZoom();
            const p = this._point.round();
            this._renderer._ctx.save();
            this._renderer._ctx.translate(p.x, p.y);
            const timeFmt = this.feature.properties.timeFmt;
            if (zoom >= 12) {
                let text;
                if (this.feature.properties.isLast) {
                    text = zoom <= 18
                        ? timeFmt
                        : `${timeFmt} ${this.feature.properties.deviceName}`;
                }
                else if (zoom >= 17) {
                    text = timeFmt;
                }
                if (text) {
                    this._renderer._ctx.fillStyle = this._map.options.baseLayerTheme === 'dark' ? 'white' : 'black';
                    this._renderer._ctx.fillText(text, icon.width / 2, 4);
                }
            }
            this._renderer._ctx.drawImage(icon, -icon.width / 2, -icon.height / 2, icon.width, icon.height);
            this._renderer._ctx.restore();
        }
    }
    L.GeolocationMarker = GeolocationMarker;
    function geolocationMarker(latlng, options) {
        return new L.GeolocationMarker(latlng, options);
    }
    L.geolocationMarker = geolocationMarker;
    class GeolocationLayer extends L.GeoJsonLayer {
        constructor(url, options) {
            options = Object.assign({
                icons: ['gis-geo-last', 'gis-geo-other'],
                refreshIntervalSeconds: 60,
            }, options);
            super(url, options);
        }
        afterInit(map) {
            const icons = this.options.icons;
            for (let i = 0; i < icons.length; i++) {
                L.geolocationMarker()._loadImage(icons[i]);
            }
        }
        pointToLayer(feature, latlng) {
            const isLast = feature.properties.isLast;
            const iconClassName = isLast ? 'gis-geo-last' : 'gis-geo-other';
            const radius = Math.min(feature.properties.acc || 0, 10000);
            const marker = L.geolocationMarker(latlng, {
                iconClassName: iconClassName,
            });
            marker.feature = feature;
            const utcDate = new Date(0);
            utcDate.setUTCMilliseconds(feature.properties.time);
            const timeFmt = `${utcDate.getHours().pad(2)}:${utcDate.getMinutes().pad(2)}`;
            marker.feature.properties.timeFmt = timeFmt;
            marker.on('mouseover', function () {
                map.fire('gis:tooltip', {
                    message: `[${timeFmt}] точность ±${Math.round(feature.properties.acc)} м. ${feature.properties.deviceName}`,
                    sourceTarget: marker
                });
            });
            const circle = L.circle(latlng, {
                interactive: false,
                bubblingMouseEvents: false,
                radius: Math.round(radius),
                color: isLast ? '#FF9200' : '#00B1FF',
                fillColor: isLast ? '#FF9200' : '#00B1FF',
                fillOpacity: 0.05,
                weight: 1
            });
            return L.layerGroup([circle, marker]);
        }
    }
    L.GeolocationLayer = GeolocationLayer;
    function geolocationLayer(url, options) {
        return new L.GeolocationLayer(url, options);
    }
    L.geolocationLayer = geolocationLayer;
})(L || (L = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VvbG9jYXRpb25MYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdlb2xvY2F0aW9uTGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBVSxDQUFDLENBOEhUO0FBOUhGLFdBQVUsQ0FBQztJQUtQLE1BQWEsaUJBQWtCLFNBQVEsQ0FBQyxDQUFDLFlBQVk7UUFPakQsVUFBVSxDQUFDLElBQWE7WUFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1lBQ3pELElBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQztnQkFBRSxPQUFPO1lBRXJDLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0MsTUFBTSxXQUFXLEdBQUcsd1VBQXdVLENBQUM7WUFDN1YsTUFBTSxZQUFZLEdBQUcsd1VBQXdVLENBQUM7WUFFOVYsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxhQUFhLEtBQUssY0FBYyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDaEgsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUc7Z0JBQy9CLEdBQUcsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQztRQUNOLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBVTtZQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lB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