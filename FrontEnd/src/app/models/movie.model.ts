export interface Movie {
  id: number;
  titulo: string;
  sinopse: string;
  poster_path: string;
  nota: number;
  data_lancamento: string;
  idioma_original: string;
  duracao: number;
  classificacao: string;
  tagline: string;
  genero?: string;
  genero_detalhes?: {
    id: number;
    nome: string;
  };
  foi_visto: boolean;
  tipo_avaliacao: 'LIKE' | 'DISLIKE' | null;
}
