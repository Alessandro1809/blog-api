import 'dotenv/config'
import { db } from './db/index.js'
import { posts } from './db/schema.js'
import { safeJsonStringify } from './utils/json-parser.js'

const samplePosts = [
  {
    title: 'Introducción al Derecho Constitucional',
    slug: 'introduccion-derecho-constitucional',
    excerpt: 'Una guía completa sobre los fundamentos del derecho constitucional mexicano.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'El derecho constitucional es la rama del derecho público que estudia las normas fundamentales que definen un Estado.' }
          ]
        }
      ]
    },
    categorie: 'ARTICULOS',
    tags: ['constitucional', 'derecho público', 'fundamentos'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    authorId: 'user_seed_author_1',
    views: 150
  },
  {
    title: 'Guía Práctica de Amparo',
    slug: 'guia-practica-amparo',
    excerpt: 'Todo lo que necesitas saber sobre el juicio de amparo en México.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'El juicio de amparo es un medio de defensa constitucional para proteger los derechos fundamentales.' }
          ]
        }
      ]
    },
    categorie: 'GUIAS_LEGALES',
    tags: ['amparo', 'derechos humanos', 'procedimiento'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
    authorId: 'user_seed_author_1',
    views: 320
  },
  {
    title: 'Análisis de la Sentencia sobre Matrimonio Igualitario',
    slug: 'analisis-sentencia-matrimonio-igualitario',
    excerpt: 'Comentario sobre la histórica sentencia de la SCJN en materia de matrimonio igualitario.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'La Suprema Corte de Justicia de la Nación emitió una sentencia histórica reconociendo el derecho al matrimonio igualitario.' }
          ]
        }
      ]
    },
    categorie: 'JURISPRUDENCIA_COMENTADA',
    tags: ['matrimonio igualitario', 'SCJN', 'derechos LGBT+'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800',
    authorId: 'user_seed_author_2',
    views: 580
  },
  {
    title: 'Reforma al Poder Judicial 2024',
    slug: 'reforma-poder-judicial-2024',
    excerpt: 'Últimas noticias sobre la reforma al poder judicial en México.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Se aprobó una reforma constitucional que modifica la estructura del poder judicial mexicano.' }
          ]
        }
      ]
    },
    categorie: 'NOTICIAS',
    tags: ['reforma', 'poder judicial', 'actualidad'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    authorId: 'user_seed_author_2',
    views: 890
  },
  {
    title: 'La Importancia de la Presunción de Inocencia',
    slug: 'importancia-presuncion-inocencia',
    excerpt: 'Reflexión sobre uno de los principios fundamentales del derecho penal.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'La presunción de inocencia es un derecho humano fundamental que debe ser respetado en todo proceso penal.' }
          ]
        }
      ]
    },
    categorie: 'OPINION',
    tags: ['presunción de inocencia', 'derecho penal', 'derechos humanos'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800',
    authorId: 'user_seed_author_1',
    views: 420
  },
  {
    title: 'Reseña: Teoría Pura del Derecho de Hans Kelsen',
    slug: 'resena-teoria-pura-derecho-kelsen',
    excerpt: 'Análisis crítico de la obra fundamental de Hans Kelsen.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'La Teoría Pura del Derecho es una de las obras más influyentes en la filosofía jurídica del siglo XX.' }
          ]
        }
      ]
    },
    categorie: 'RESENAS',
    tags: ['Hans Kelsen', 'filosofía del derecho', 'teoría jurídica'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    authorId: 'user_seed_author_2',
    views: 210
  },
  {
    title: 'Borrador: Nuevo Artículo sobre Derecho Laboral',
    slug: 'borrador-derecho-laboral',
    excerpt: 'Este es un artículo en proceso de revisión.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Contenido en desarrollo...' }
          ]
        }
      ]
    },
    categorie: 'ARTICULOS',
    tags: ['derecho laboral', 'trabajo'],
    status: 'DRAFT',
    featuredImage: null,
    authorId: 'user_seed_author_1',
    views: 0
  },
  {
    title: 'Derechos Digitales en la Era de la IA',
    slug: 'derechos-digitales-era-ia',
    excerpt: 'Explorando los nuevos desafíos legales que plantea la inteligencia artificial.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'La inteligencia artificial plantea nuevos retos para la protección de los derechos fundamentales en el entorno digital.' }
          ]
        }
      ]
    },
    categorie: 'ARTICULOS',
    tags: ['IA', 'derechos digitales', 'tecnología', 'privacidad'],
    status: 'PUBLISHED',
    featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    authorId: 'user_seed_author_2',
    views: 1250
  }
]

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...')

    console.log('📝 Limpiando datos existentes...')
    await db.delete(posts)

    console.log('✨ Insertando posts de ejemplo...')
    for (const post of samplePosts) {
      await db.insert(posts).values({
        ...post,
        content: safeJsonStringify(post.content),
        tags: safeJsonStringify(post.tags)
      })
      console.log(`  ✓ Creado: ${post.title}`)
    }

    console.log('\n✅ Seed completado exitosamente!')
    console.log(`📊 Total de posts creados: ${samplePosts.length}`)
    console.log(`   - Publicados: ${samplePosts.filter(p => p.status === 'PUBLISHED').length}`)
    console.log(`   - Borradores: ${samplePosts.filter(p => p.status === 'DRAFT').length}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    process.exit(1)
  }
}

seed()
