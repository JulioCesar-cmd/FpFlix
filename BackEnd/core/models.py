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
    # ✅ Adicionado para corrigir o erro no script de popular
    backdrop_path = models.CharField(max_length=255, blank=True, null=True)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)

    # Relacionamento Many-to-Many para suportar múltiplos gêneros por filme
    generos = models.ManyToManyField(Genero, related_name="filmes")

    nota = models.FloatField(default=0.0)
    data_lancamento = models.DateField(null=True, blank=True)
    idioma_original = models.CharField(max_length=10, default="en")
    duracao = models.IntegerField(null=True, blank=True)
    classificacao = models.CharField(max_length=10, blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class Favorito(models.Model):
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="favoritos"
    )
    filme = models.ForeignKey(
        Filme,
        on_delete=models.CASCADE,
        related_name="favoritado_por"
    )
    data_adicionado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("usuario", "filme")

    def __str__(self):
        return f"{self.usuario.username} favoritou {self.filme.titulo}"

class Avaliacao(models.Model):
    TIPOS = (
        ("LIKE", "Gostei"),
        ("DISLIKE", "Não Gostei"),
    )
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="avaliacoes"
    )
    filme = models.ForeignKey(
        Filme,
        on_delete=models.CASCADE,
        related_name="avaliacoes"
    )
    tipo = models.CharField(max_length=10, choices=TIPOS)
    data_avaliacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("usuario", "filme")

    def __str__(self):
        return f"{self.usuario.username} - {self.filme.titulo} ({self.tipo})"