import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Base.settings')
django.setup()

from core.models import Filme, Genero

def popular():
    API_KEY = 'bb482b8769db20b6bad3c5187c230c2a'
    URL_BASE = 'https://api.themoviedb.org/3'

    META_TOTAL = 400
    filmes_no_banco = Filme.objects.count()

    if filmes_no_banco >= META_TOTAL:
        print(f"😎 Meta já atingida! Total no banco: {filmes_no_banco}")
        return

    print(f"🚀 Iniciando... Banco atual: {filmes_no_banco} filmes. Meta recomendada: {META_TOTAL}")

    pagina = 1
    while Filme.objects.count() < META_TOTAL and pagina < 200:
        print(f"📂 Analisando página {pagina}...")
        res = requests.get(f"{URL_BASE}/movie/popular?api_key={API_KEY}&language=pt-BR&page={pagina}")

        if res.status_code != 200: break
        filmes_lista = res.json().get('results', [])

        for f in filmes_lista:
            if Filme.objects.count() >= META_TOTAL: break

            if not all([f.get('overview'), f.get('poster_path'), f.get('release_date')]):
                continue

            detalhes_res = requests.get(f"{URL_BASE}/movie/{f['id']}?api_key={API_KEY}&language=pt-BR&append_to_response=release_dates")
            if detalhes_res.status_code != 200: continue
            detalhes = detalhes_res.json()

            runtime = detalhes.get('runtime')
            tagline = detalhes.get('tagline')

            if not runtime or runtime == 0 or not tagline:
                continue

            certificacao = "L"
            for country in detalhes.get('release_dates', {}).get('results', []):
                if country['iso_3166_1'] == 'BR':
                    releases = country.get('release_dates', [])
                    if releases:
                        certificacao = releases[0].get('certification') or "L"

            # CORREÇÃO AQUI: Busca pelo tmdb_id para evitar conflito com a Primary Key (ID) do Postgres
            gen_obj = None
            if detalhes.get('genres'):
                g_data = detalhes['genres'][0]

                # Primeiro tentamos encontrar o gênero pelo tmdb_id
                gen_obj = Genero.objects.filter(tmdb_id=g_data['id']).first()

                # Se não existir, criamos um novo sem forçar o ID primário
                if not gen_obj:
                    gen_obj = Genero.objects.create(
                        tmdb_id=g_data['id'],
                        nome=g_data['name']
                    )

            if not gen_obj: continue

            obj, created = Filme.objects.update_or_create(
                tmdb_id=f['id'],
                defaults={
                    'titulo': f['title'],
                    'sinopse': f['overview'],
                    'poster_path': f['poster_path'],
                    'genero': gen_obj,
                    'nota': f.get('vote_average', 0.0),
                    'data_lancamento': f.get('release_date'),
                    'idioma_original': f.get('original_language', 'en'),
                    'duracao': runtime,
                    'classificacao': certificacao,
                    'tagline': tagline
                }
            )

            if created:
                print(f"✅ [{Filme.objects.count()}/{META_TOTAL}] Novo filme: {f['title']}")

        pagina += 1

    print(f"🏁 Finalizado! Seu catálogo agora tem {Filme.objects.count()} filmes de alta qualidade.")

if __name__ == "__main__":
    popular()