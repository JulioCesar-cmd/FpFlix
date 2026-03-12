import os
import django
import requests
import time
from collections import Counter

# Configuração do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Base.settings')
django.setup()

from core.models import Filme, Genero

API_KEY = 'bb482b8769db20b6bad3c5187c230c2a'
URL_BASE = "https://api.themoviedb.org/3"

def top_generos():
    contador = Counter()
    for pagina in range(1, 6):
        res = requests.get(f"{URL_BASE}/movie/popular?api_key={API_KEY}&language=pt-BR&page={pagina}")
        if res.status_code == 200:
            filmes = res.json().get("results", [])
            for filme in filmes:
                for g in filme.get("genre_ids", []):
                    contador[g] += 1
    return [g[0] for g in contador.most_common(10)]

def buscar_generos():
    res = requests.get(f"{URL_BASE}/genre/movie/list?api_key={API_KEY}&language=pt-BR")
    return res.json().get("genres", []) if res.status_code == 200 else []

def popular():
    print("🎬 Descobrindo gêneros populares...")
    top10_ids = top_generos()
    generos_api = buscar_generos()
    generos_dict = {g["id"]: g["name"] for g in generos_api}

    for genero_id in top10_ids:
        nome_genero = generos_dict.get(genero_id)
        if not nome_genero: continue

        print(f"\n📂 Processando Gênero: {nome_genero}")
        genero_obj, _ = Genero.objects.get_or_create(
            tmdb_id=genero_id,
            defaults={"nome": nome_genero}
        )

        pagina = 1
        filmes_adicionados = 0

        while filmes_adicionados < 25:
            res = requests.get(
                f"{URL_BASE}/discover/movie?api_key={API_KEY}&language=pt-BR&with_genres={genero_id}&page={pagina}&sort_by=popularity.desc"
            )
            if res.status_code != 200: break

            filmes = res.json().get("results", [])
            for f in filmes:
                if filmes_adicionados >= 25: break

                # Validação de campos essenciais (Adicionado backdrop_path)
                if not f.get("poster_path") or not f.get("backdrop_path") or not f.get("overview"):
                    continue

                # Se o filme já existe, apenas associamos ao novo gênero (ManyToMany)
                if Filme.objects.filter(tmdb_id=f['id']).exists():
                    filme_obj = Filme.objects.get(tmdb_id=f['id'])
                    if genero_obj not in filme_obj.generos.all():
                        filme_obj.generos.add(genero_obj)
                        print(f"🔗 {f['title']} associado também a {nome_genero}")
                    continue

                # Buscar detalhes para pegar o Runtime e Tagline
                detalhes_res = requests.get(f"{URL_BASE}/movie/{f['id']}?api_key={API_KEY}&language=pt-BR")
                if detalhes_res.status_code != 200: continue
                detalhes = detalhes_res.json()

                runtime = detalhes.get("runtime")
                if not runtime or runtime == 0: continue

                # Criar novo filme
                filme_obj = Filme.objects.create(
                    tmdb_id=f["id"],
                    titulo=f["title"],
                    sinopse=f["overview"],
                    poster_path=f["poster_path"],
                    backdrop_path=f["backdrop_path"], # ✅ Essencial para o banner
                    nota=f.get("vote_average", 0),
                    data_lancamento=f.get("release_date") or None,
                    idioma_original=f.get("original_language"),
                    duracao=runtime,
                    tagline=detalhes.get("tagline")
                )

                # ✅ Adicionando ao ManyToManyField
                filme_obj.generos.add(genero_obj)

                filmes_adicionados += 1
                print(f"✅ [{filmes_adicionados}/25] {filme_obj.titulo}")

            pagina += 1
            time.sleep(0.1) # Respeitar o limite da API do lab

    print(f"\n🏁 Banco populado com sucesso! Total: {Filme.objects.count()} filmes.")

if __name__ == "__main__":
    popular()