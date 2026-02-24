from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import FilmeViewSet, GeneroViewSet, FavoritoViewSet, RegisterView
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'filmes', FilmeViewSet)
router.register(r'generos', GeneroViewSet)
router.register(r'favoritos', FavoritoViewSet, basename='favoritos')

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),

    path('api/register/', RegisterView.as_view(), name='auth_register'),

    path('api/login/', obtain_auth_token, name='api_token_auth'),

    path('api-auth/', include('rest_framework.urls')),
]