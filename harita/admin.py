from django.contrib.gis import admin
from .models import State
from leaflet.admin import LeafletGeoAdmin


# Register your models here.

class StateAdmin(LeafletGeoAdmin):
    pass


admin.site.register(State, StateAdmin)
