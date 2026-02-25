import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Base.settings')
django.setup()

from core.models import Filme, Genero


def popular():
    API_KEY = 'bb482b8769db20b6bad3c5187c230c2a'
    URL_BASE = 'https://api.themoviedb.org/3'

    filmes_no_banco = Filme.objects.count()
    meta_total = filmes_no_banco + 100

    filmes_adicionados_nesta_execucao = 0
    pagina = 1

    print(f"Iniciando... Você já tem {filmes_no_banco} filmes. Meta final: {meta_total}")

    while Filme.objects.count() < meta_total and pagina < 50:
        print(f"Buscando página {pagina} da TMDB...")
        res = requests.get(f"{URL_BASE}/movie/popular?api_key={API_KEY}&language=pt-BR&page={pagina}")
        filmes_lista = res.json().get('results', [])

        for f in filmes_lista:
            if Filme.objects.count() >= meta_total:
                break

            existe = Filme.objects.filter(tmdb_id=f['id']).exists()

            detalhes = requests.get(
                f"{URL_BASE}/movie/{f['id']}?api_key={API_KEY}&language=pt-BR&append_to_response=release_dates").json()

            runtime = detalhes.get('runtime')
            if not runtime or runtime == 0:
                continue

            if not f.get('overview'):
                continue

            certificacao = "L"
            for country in detalhes.get('release_dates', {}).get('results', []):
                if country['iso_3166_1'] == 'BR':
                    res_list = country.get('release_dates', [])
                    if res_list:
                        res_cert = res_list[0].get('certification')
                        if res_cert:
                            certificacao = res_cert

            # Pegamos o objeto de Gênero (certifique-se de que os gêneros já foram populados)
            gen_id = f['genre_ids'][0] if f['genre_ids'] else None
            gen_obj = Genero.objects.filter(id=gen_id).first()

            obj, created = Filme.objects.update_or_create(
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

            if created:
                filmes_adicionados_nesta_execucao += 1
                print(f"Novo filme adicionado: {f['title']} (Total novo: {filmes_adicionados_nesta_execucao})")

        pagina += 1

    print(f"Concluído! Total de filmes no banco agora: {Filme.objects.count()}")


if __name__ == "__main__":
    popular()