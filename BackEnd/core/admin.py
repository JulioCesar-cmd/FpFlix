from django.contrib import admin
from .models import Genero, Filme, Favorito

admin.site.register(Genero)
admin.site.register(Filme)
admin.site.register(Favorito)