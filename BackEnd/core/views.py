from rest_framework import viewsets, permissions, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .serializers import (
    FilmeSerializer, GeneroSerializer, FavoritoSerializer,
    RegisterSerializer, AvaliacaoSerializer, FilmeVistoSerializer
)
from .models import Filme, Genero, Favorito, Avaliacao, FilmeVisto

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class FilmeViewSet(viewsets.ModelViewSet):
    queryset = Filme.objects.all()
    serializer_class = FilmeSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['titulo', 'sinopse']
    filterset_fields = ['genero']

    @action(detail=True, methods=['get'])
    def recomendados(self, request, pk=None): # Adicionei os argumentos padrão da action
        filme_atual = self.get_object()
        recomendacoes = Filme.objects.filter(
            genero=filme_atual.genero
        ).exclude(id=filme_atual.id).order_by('?')[:5]

        serializer = self.get_serializer(recomendacoes, many=True)
        return Response(serializer.data)

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

class FavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user)

class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class FilmeVistoViewSet(viewsets.ModelViewSet):
    serializer_class = FilmeVistoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FilmeVisto.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)