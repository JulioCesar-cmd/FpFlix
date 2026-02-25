from rest_framework import serializers
from .models import Filme, Genero, Favorito, Avaliacao, FilmeVisto
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'

class FilmeSerializer(serializers.ModelSerializer):
    genero_detalhes = GeneroSerializer(source='genero', read_only=True)
    media_usuarios = serializers.ReadOnlyField(source='media_avaliacoes')

    class Meta:
        model = Filme
        fields = [
            'id', 'titulo', 'sinopse', 'poster_path', 'tmdb_id',
            'genero', 'genero_detalhes', 'media_usuarios', 'nota',
            'duracao', 'classificacao', 'tagline', 'data_lancamento'
        ]

class FavoritoSerializer(serializers.ModelSerializer):
    filme_detalhes = FilmeSerializer(source='filme', read_only=True)

    class Meta:
        model = Favorito
        fields = ['id', 'filme', 'filme_detalhes']

    def create(self, validated_data):
        user = self.context['request'].user
        favorito, created = Favorito.objects.get_or_create(usuario=user, **validated_data)
        return favorito

class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Avaliacao
        fields = ['id', 'usuario_nome', 'filme', 'nota', 'comentario', 'data_criacao']

class FilmeVistoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilmeVisto
        fields = ['id', 'filme', 'data_visto']

    def create(self, validated_data):
        user = self.context['request'].user
        visto, created = FilmeVisto.objects.get_or_create(usuario=user, **validated_data)
        return visto