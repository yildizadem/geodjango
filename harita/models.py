from django.db import models
from django.contrib.gis.db import models

# Create your models here.
class State(models.Model):
    name = models.CharField(max_length=20)
    test = models.CharField(max_length=20, null=True)
    best = models.CharField(max_length=20, null=True)
    jest = models.CharField(max_length=20, null=True)
    geometry = models.PolygonField()

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name
