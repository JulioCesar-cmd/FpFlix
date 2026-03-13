from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User

from .serializers import (
    FilmeSerializer, GeneroSerializer, FavoritoSerializer,
    RegisterSerializer
)
from .models import Filme, Genero, Favorito, Avaliacao

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class FilmeViewSet(viewsets.ModelViewSet):
    queryset = Filme.objects.prefetch_related('generos').all()
    serializer_class = FilmeSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['titulo', 'sinopse']
    filterset_fields = {
        'generos__nome': ['exact', 'icontains'],
        'generos': ['exact'],
    }

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'lista_por_genero', 'recomendados']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        query_params = request.query_params
        has_filter = any(param in query_params for param in ['generos__nome', 'generos', 'search'])

        if not has_filter:
            queryset = queryset.order_by('?')[:80]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def recomendados(self, request, pk=None):
        filme_atual = self.get_object()

        # ✅ NOVA LÓGICA: Pega os IDs de TODOS os gêneros do filme
        generos_ids = filme_atual.generos.values_list('id', flat=True)

        # ✅ Busca filmes que compartilhem QUALQUER um desses gêneros
        # Ordenado aleatoriamente para variar a sugestão
        recomendacoes = Filme.objects.filter(
            generos__id__in=generos_ids
        ).exclude(id=filme_atual.id).distinct().order_by('?')[:15]

        serializer = self.get_serializer(recomendacoes, many=True, context={'request': request})
        return Response(serializer.data)

    # ... (restante das actions: lista_por_genero, favoritar, meus_favoritos, avaliar, assistir_novamente permanecem iguais)
    @action(detail=False, methods=['get'])
    def lista_por_genero(self, request):
        generos = Genero.objects.all()
        resposta_agrupada = []
        for g in generos:
            # ✅ Aumentamos de 20 para 100 para garantir que a busca encontre tudo
            filmes = Filme.objects.filter(generos=g).order_by('-nota')[:100]
            if filmes.exists():
                serializer = self.get_serializer(filmes, many=True, context={'request': request})
                resposta_agrupada.append({
                    'id_genero': g.id,
                    'nome_genero': g.nome,
                    'filmes': serializer.data
                })
        return Response(resposta_agrupada)

    @action(detail=True, methods=['post'])
    def favoritar(self, request, pk=None):
        filme = self.get_object()
        user = request.user
        favorito_existente = Favorito.objects.filter(usuario=user, filme=filme).first()
        if favorito_existente:
            favorito_existente.delete()
            return Response({'status': 'removido', 'is_favorito': False}, status=status.HTTP_200_OK)
        Favorito.objects.create(usuario=user, filme=filme)
        return Response({'status': 'adicionado', 'is_favorito': True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def meus_favoritos(self, request):
        favoritos = Favorito.objects.filter(usuario=request.user).select_related('filme')
        filmes = [fav.filme for fav in favoritos]
        serializer = self.get_serializer(filmes, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def avaliar(self, request, pk=None):
        filme = self.get_object()
        user = request.user
        tipo_voto = request.data.get('tipo')
        if tipo_voto not in ['LIKE', 'DISLIKE']:
            return Response({'error': 'Tipo de voto inválido'}, status=status.HTTP_400_BAD_REQUEST)
        Avaliacao.objects.update_or_create(
            usuario=user, filme=filme,
            defaults={'tipo': tipo_voto}
        )
        return Response({'status': 'avaliado', 'tipo': tipo_voto}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def assistir_novamente(self, request):
        avaliacoes = Avaliacao.objects.filter(
            usuario=request.user,
            tipo='LIKE'
        ).select_related('filme').order_by('-id')[:15]
        filmes = [av.filme for av in avaliacoes]
        serializer = self.get_serializer(filmes, many=True, context={'request': request})
        return Response(serializer.data)

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

class FavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user)