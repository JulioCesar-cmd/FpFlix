import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Base.settings')
django.setup()

from core.models import Filme, Genero


def popular():
    API_KEY = 'bb482b8769db20b6bad3c5187c230c2a'
    URL_BASE = 'https://api.themoviedb.org/3'


    filmes_salvos = 0
    pagina = 1

    # Vamos rodar até conseguir 100 filmes completos
    while filmes_salvos < 100 and pagina < 20:
        print(f"Buscando página {pagina} da TMDB...")
        res = requests.get(f"{URL_BASE}/movie/popular?api_key={API_KEY}&language=pt-BR&page={pagina}")
        filmes_lista = res.json().get('results', [])

        for f in filmes_lista:
            if filmes_salvos >= 100: break

            detalhes = requests.get(
                f"{URL_BASE}/movie/{f['id']}?api_key={API_KEY}&language=pt-BR&append_to_response=release_dates").json()

            runtime = detalhes.get('runtime')
            if not runtime or runtime == 0:
                continue

            if not f.get('overview'):
                continue

            certificacao = "L"  #
            for country in detalhes.get('release_dates', {}).get('results', []):
                if country['iso_3166_1'] == 'BR':
                    res_cert = country['release_dates'][0].get('certification')
                    if res_cert:
                        certificacao = res_cert

            gen_id = f['genre_ids'][0] if f['genre_ids'] else None
            gen_obj = Genero.objects.filter(id=gen_id).first()

            Filme.objects.update_or_create(
                tmdb_id=f['id'],
                defaults={
                    'titulo': f['title'],
                    'sinopse': f['overview'],
                    'poster_path': f['poster_path'],
                    'genero': gen_obj,
                    'nota': f.get('vote_average', 0.0),
                    'data_lancamento': f.get('release_date') if f.get('release_date') else None,
                    'idioma_original': f.get('original_language', 'en'),
                    'duracao': runtime,
                    'classificacao': certificacao,
                    'tagline': detalhes.get('tagline', '')
                }
            )
            filmes_salvos += 1

        pagina += 1


if __name__ == "__main__":
    popular()