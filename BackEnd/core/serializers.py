from rest_framework import serializers
from .models import Filme, Genero, Favorito
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

    class Meta:
        model = Filme
        fields = ['id', 'titulo', 'sinopse', 'poster_path', 'tmdb_id', 'genero', 'genero_detalhes']

class FavoritoSerializer(serializers.ModelSerializer):
    filme_detalhes = FilmeSerializer(source='filme', read_only=True)

    class Meta:
        model = Favorito
        fields = ['id', 'filme', 'filme_detalhes']

    def create(self, validated_data):
        # Pega o usuário logado automaticamente pelo contexto da requisição
        user = self.context['request'].user
        return Favorito.objects.create(usuario=user, **validated_data)