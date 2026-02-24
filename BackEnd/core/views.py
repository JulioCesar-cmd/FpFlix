from rest_framework import viewsets, permissions
from .models import Filme, Genero, Favorito
from .serializers import FilmeSerializer, GeneroSerializer, FavoritoSerializer
from rest_framework import viewsets, permissions, filters
from rest_framework import generics
from .serializers import RegisterSerializer
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response

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
    def recomendados(self, request, pk=None):
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
    permission_classes = [permissions.IsAuthenticated] # Exige login

    def get_queryset(self):
        # Retorna apenas os favoritos do usuário que está logado
        return Favorito.objects.filter(usuario=self.request.user)