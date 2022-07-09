mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: foundOpportunity.geometry.coordinates,
    zoom: 10
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(foundOpportunity.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${foundOpportunity.title}</h3><p>${foundOpportunity.location}</p>`
            )
    )
    .addTo(map)