from rest_framework import serializers
from .models import Filme, Genero, Favorito, Avaliacao
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ['id', 'nome', 'tmdb_id']

class AvaliacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avaliacao
        fields = ['id', 'tipo', 'data_avaliacao']

class FilmeSerializer(serializers.ModelSerializer):
    # Agora 'generos' retorna o objeto completo diretamente.
    generos = GeneroSerializer(many=True, read_only=True)

    nota = serializers.FloatField()
    foi_visto = serializers.SerializerMethodField()
    tipo_avaliacao = serializers.SerializerMethodField()

    class Meta:
        model = Filme
        fields = [
            'id', 'titulo', 'sinopse', 'poster_path',
            'backdrop_path', 'tmdb_id', 'generos', 'nota',
            'duracao', 'classificacao', 'tagline', 'data_lancamento',
            'idioma_original',  # ✅ ADICIONADO AQUI
            'foi_visto', 'tipo_avaliacao'
        ]

    def get_foi_visto(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Avaliacao.objects.filter(usuario=request.user, filme=obj).exists()
        return False

    def get_tipo_avaliacao(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            avaliacao = Avaliacao.objects.filter(usuario=request.user, filme=obj).first()
            return avaliacao.tipo if avaliacao else None
        return None

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este e-mail já está cadastrado.")]
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={"min_length": "A senha deve ter pelo menos 8 caracteres."}
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("O nome de usuário não pode conter espaços.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class FavoritoSerializer(serializers.ModelSerializer):
    # Relacionado ao ManyToMany do seu models.py
    filme_detalhes = FilmeSerializer(source='filme', read_only=True)

    class Meta:
        model = Favorito
        fields = ['id', 'filme', 'filme_detalhes', 'data_adicionado']

    def create(self, validated_data):
        user = self.context['request'].user
        favorito, created = Favorito.objects.get_or_create(usuario=user, **validated_data)
        return favorito