import os
from pathlib import Path
from datetime import timedelta

# Caminho base do projeto
BASE_DIR = Path(__file__).resolve().parent.parent

# Configurações de Segurança
SECRET_KEY = 'django-insecure-vk5(iyjq@laro$*ly0$8*42beoxizm0wzrj(6%s+)(=4w4p3+5'
DEBUG = True
ALLOWED_HOSTS = []

# Aplicações Instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Bibliotecas de Terceiros
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt', # Adicionado para o Token
    'django_filters',
    
    # Sua App
    'core',
]

# Middlewares (A ordem aqui é vital para o CORS)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Sempre em primeiro
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Base.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Base.wsgi.application'

# Banco de Dados SQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuração do Django REST Framework para usar JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        # ✅ MUDE DE 'IsAuthenticated' PARA 'AllowAny'
        'rest_framework.permissions.AllowAny',
    ],
}

# Configuração do Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Internacionalização
LANGUAGE_CODE = 'pt-br' # Mudei para português
TIME_ZONE = 'America/Manaus' # Sua região
USE_I18N = True
USE_TZ = True

# Arquivos Estáticos
STATIC_URL = 'static/'

# Configurações de CORS
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]