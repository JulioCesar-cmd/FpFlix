from django.db import models
from django.contrib.auth.models import User

class Genero(models.Model):
    nome = models.CharField(max_length=100)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.nome

class Filme(models.Model):
    titulo = models.CharField(max_length=255)
    sinopse = models.TextField(blank=True, null=True)
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    genero = models.ForeignKey(Genero, on_delete=models.SET_NULL, null=True, related_name='filmes')
    nota = models.FloatField(default=0.0)
    data_lancamento = models.DateField(null=True, blank=True)
    idioma_original = models.CharField(max_length=10, default='en')
    duracao = models.IntegerField(null=True, blank=True)
    classificacao = models.CharField(max_length=10, blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.titulo

class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meus_favoritos')
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE)
    data_adicionado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'filme') # Evita duplicados