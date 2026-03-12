export interface Movie {
  id: number;
  titulo: string;
  sinopse: string;
  poster_path: string;
  backdrop_path: string; // ✅ O banner horizontal para o Hero e Detalhes
  nota: number;
  data_lancamento: string;
  idioma_original: string;
  duracao: number;
  classificacao: string;
  tagline: string;

  // Ajustado para Many-to-Many conforme o novo models.py
  generos?: number[];
  generos_detalhes?: {
    id: number;
    nome: string;
  }[]; // ✅ Agora é uma lista de objetos

  foi_visto: boolean;
  tipo_avaliacao: 'LIKE' | 'DISLIKE' | null;
}
