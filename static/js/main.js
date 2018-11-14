let source = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
        return "http://127.0.0.1:8000/layerwfs?service=WFS&version=1.0.0&request=GetFeature&typeName=postgresql%3Aharita_state&" + extent.join(",") + "&outputFormat=application%2Fjson"
    },
    strategy: ol.loadingstrategy.bbox
});
let vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#000000',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});
// {
//     #let
//     a = new ol.format.GeoJSON();
//     #
// }


let untiled = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        ratio: 1,
        url: 'http://127.0.0.1:8000/layerwms',
        params: {
            'FORMAT': "image/png",
            'VERSION': '1.1.1',
            "LAYERS": 'postgresql:harita_state',
            "exceptions": 'application/vnd.ogc.se_inimage',
        }
    })
});


let raster = new ol.layer.Tile({source: new ol.source.OSM()})
let map = new ol.Map({
    layers: [raster, vector, untiled],
    target: "map",
    view: new ol.View({
        center: [35, 39],
        zoom: 7,
        projection: 'EPSG:4326',
    })
});
let lastGeometry = null;
let modify;
let kaydet = function (event) {
    let feature = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "",
                "coordinates": []
            }
        }]
    };
    let deselectedFeature = event.selected[0];
    feature.features[0].geometry.type = deselectedFeature.getGeometry().getType();
    feature.features[0].geometry.coordinates = deselectedFeature.getGeometry().getCoordinates();
    // feature.features[0].properties = deselectedFeature.getProperties();
    let props = deselectedFeature.getProperties();
    delete props.geometry;
    for (let i in props) {
        feature.features[0].properties[i] = $(`#${i}-identify-prop`).val();
        deselectedFeature.values_[i] = $(`#${i}-identify-prop`).val();
    }
    feature.features[0].properties.id = deselectedFeature.getId().split(".")[1];

    // delete feature.features[0].properties.geometry;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                let cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    let csrftoken = getCookie('csrftoken');
    $.ajax({
        type: "POST",
        url: "/states",
        // The key needs to match your method's input parameter (case-sensitive).
        data: JSON.stringify(feature),
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            select.getFeatures().pop();
            map.removeInteraction(modify);
            let identifyTable = $('#identifyTable');
            identifyTable.css("display", "none");
            identifyTable.empty();
        },
        error: function (err) {
            console.log(err);
        },
        beforeSend: function (xhr, settings) {

            xhr.setRequestHeader("X-CSRFToken", csrftoken);

        }
    });
};
let iptal = function (event) {
    let deselectedFeature = event.selected[0];
    deselectedFeature.getGeometry().setCoordinates(lastGeometry);
    let identifyTable = $('#identifyTable');
    select.getFeatures().pop();
    map.removeInteraction(modify);
    identifyTable.css("display", "none");
    identifyTable.empty();
};


let select = new ol.interaction.Select();
select.on("select", function (event) {
    console.log({"selectedEvent": event});
    let identifyTable = $('#identifyTable');
    if (event.selected.length > 0) {
        let col = new ol.Collection();
        col.push(event.selected[0]);
        modify = new ol.interaction.Modify({
            features: col
        });
        map.addInteraction(modify);
        let properties = event.selected[0].getProperties();
        lastGeometry = event.selected[0].getGeometry().getCoordinates();
        delete properties.geometry;
        identifyTable.empty();
        for (let i in properties) {
            identifyTable.append(`<div><label for="${i}-identify-prop">${i} : </label></div><div><input type="text" id="${i}-identify-prop" value="${properties[i] == null ? "" : properties[i]}"></div>`)
        }
        let butonKaydet = $('<button>Kaydet</button>');
        butonKaydet.click(function (evt) {
            kaydet(event)
        });
        identifyTable.append(butonKaydet);
        let butonIptal = $('<button>İptal</button>');
        butonIptal.click(function (evt) {
            iptal(event)
        });
        identifyTable.append(butonIptal);
        identifyTable.css("display", "block");
    } else {
        map.removeInteraction(modify);
        event.deselected[0].getGeometry().setCoordinates(lastGeometry);
        identifyTable.css("display", "none");
        identifyTable.empty();
    }

});
map.addInteraction(select)