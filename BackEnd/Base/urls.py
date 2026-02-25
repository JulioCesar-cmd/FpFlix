from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import (
    FilmeViewSet,
    GeneroViewSet,
    FavoritoViewSet,
    RegisterView,
    AvaliacaoViewSet,
    FilmeVistoViewSet
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'filmes', FilmeViewSet)
router.register(r'generos', GeneroViewSet)
router.register(r'favoritos', FavoritoViewSet, basename='favoritos')
router.register(r'avaliacoes', AvaliacaoViewSet)
router.register(r'vistos', FilmeVistoViewSet, basename='vistos')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/register/', RegisterView.as_view(), name='auth_register'),

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api-auth/', include('rest_framework.urls')),
]