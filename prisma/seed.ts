import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Los usuarios se obtienen de Clerk, solo creamos posts
  const posts = [
    {
      slug: 'introduccion-derecho-constitucional',
      excerpt: 'Una guía completa sobre los fundamentos del derecho constitucional y su aplicación práctica.',
      title: 'Introducción al Derecho Constitucional',
      content: {
        blocks: [
          { type: "paragraph", content: "El derecho constitucional es la rama del derecho público que estudia..." },
          { type: "heading", level: 2, content: "Principios fundamentales" }
        ]
      },
      categorie: 'ARTICULOS',
      tags: ['derecho-constitucional', 'derecho-publico', 'fundamentos'],
      status: 'PUBLISHED' as const,
      featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
      authorId: 'user_34FD8o8snDoU1gkatJvprZyxYR3',
      views: 150
    },
    {
      slug: 'guia-contratos-civiles',
      excerpt: 'Todo lo que necesitas saber sobre la elaboración y validez de contratos civiles.',
      title: 'Guía Práctica de Contratos Civiles',
      content: {
        blocks: [
          { type: "paragraph", content: "Los contratos civiles son acuerdos de voluntades..." },
          { type: "heading", level: 2, content: "Elementos esenciales" }
        ]
      },
      categorie: 'GUIAS_LEGALES',
      tags: ['contratos', 'derecho-civil', 'guia-practica'],
      status: 'PUBLISHED' as const,
      featuredImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      authorId: 'user_34FD8o8snDoU1gkatJvprZyxYR3',
      views: 230
    },
    {
      slug: 'analisis-sentencia-amparo-2024',
      excerpt: 'Análisis detallado de la reciente sentencia sobre amparo constitucional.',
      title: 'Análisis: Sentencia de Amparo Constitucional 2024',
      content: {
        blocks: [
          { type: "paragraph", content: "La Suprema Corte emitió una sentencia relevante..." },
          { type: "heading", level: 2, content: "Consideraciones del tribunal" }
        ]
      },
      categorie: 'JURISPRUDENCIA_COMENTADA',
      tags: ['amparo', 'jurisprudencia', 'suprema-corte'],
      status: 'PUBLISHED' as const,
      featuredImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
      authorId: 'user_3OjA9L0M4nQ5rS6tU7vW8xY9',
      views: 180
    },
    {
      slug: 'reforma-codigo-penal-2024',
      excerpt: 'Últimas noticias sobre las reformas al código penal aprobadas este año.',
      title: 'Reforma al Código Penal 2024',
      categorie: 'NOTICIAS',
      tags: ['reforma', 'codigo-penal', 'legislacion'],
      status: 'PUBLISHED' as const,
      featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
      authorId: 'user_34FD8o8snDoU1gkatJvprZyxYR3',
      views: 95
    },
    {
      slug: 'opinion-justicia-digital',
      excerpt: 'Reflexiones sobre la digitalización del sistema judicial y sus implicaciones.',
      title: 'La Justicia Digital: Desafíos y Oportunidades',
      content: {
        blocks: [
          { type: "paragraph", content: "La transformación digital del poder judicial representa..." }
        ]
      },
      categorie: 'OPINION',
      tags: ['justicia-digital', 'tecnologia', 'opinion'],
      status: 'PUBLISHED' as const,
      featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      authorId: 'user_3OjA9L0M4nQ5rS6tU7vW8xY9',
      views: 120
    },
    {
      slug: 'resena-libro-derecho-procesal',
      excerpt: 'Reseña del libro "Derecho Procesal Moderno" del Dr. García López.',
      title: 'Reseña: Derecho Procesal Moderno',
      content: {
        blocks: [
          { type: "paragraph", content: "Esta obra representa una contribución significativa..." }
        ]
      },
      categorie: 'RESENAS',
      tags: ['resena', 'libros', 'derecho-procesal'],
      status: 'DRAFT' as const,
      featuredImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      authorId: 'user_34FD8o8snDoU1gkatJvprZyxYR3',
      views: 0
    }
  ]

  for (const post of posts) {
    await prisma.post.create({
      data: post
    })
  }

  console.log('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })