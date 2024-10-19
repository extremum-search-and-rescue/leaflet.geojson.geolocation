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
//# sourceMappingURL=GeolocationLayer.js.map