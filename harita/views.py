from django.contrib.auth.decorators import login_required
from django.contrib.gis.db.models.functions import AsGeoJSON
from django.http import HttpResponse
from django.shortcuts import render, redirect
from .models import State
from django.core.serializers import serialize
from django.contrib.gis.geos import GEOSGeometry
import requests
import json


# Create your views here.
def index(request):
    isim = "django"
    __states = State.objects.annotate(json=AsGeoJSON('geometry')).get(name="test").json
    return render(request, "index.html", locals())


@login_required(login_url='/admin/')
def states(request):
    if request.method == "POST":
        feature = json.loads(request.read().decode("utf-8"))
        geometry = GEOSGeometry(json.dumps(feature["features"][0]["geometry"]))
        properties = feature["features"][0]["properties"]
        print(properties)
        state = State.objects.get(id=properties["id"])
        state.geometry = geometry
        state.name = properties["name"]
        state.best = properties["best"]
        state.jest = properties["jest"]
        state.test = properties["test"]
        state.save()
        return HttpResponse('{"message": "Başarılı"}', content_type="application/json")
    else:
        __states = serialize("geojson", State.objects.all(), geometry_field="geometry",
                             fields=("name", "best", "test", "jest", "id",))
        # __states = State.objects.annotate(json=AsGeoJSON('geometry')).get(name="tr").json
        return HttpResponse(__states, content_type="application/json")


@login_required(login_url='/admin/')
def layerWms(request):
    r = requests.get("http://localhost:8080/geoserver/postgresql/wms?" + str(request.GET.urlencode()))
    print(r.content)
    return HttpResponse(r.content, content_type="image/png")


@login_required(login_url='/admin/')
def layerWfs(request):
    r = requests.get("http://localhost:8080/geoserver/postgresql/ows?" + str(request.GET.urlencode()))
    return HttpResponse(r.content, content_type="application/json")
