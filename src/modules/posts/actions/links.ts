"use server";

import axios from 'axios';
import * as cheerio from 'cheerio';

function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export async function getLinkMetadata(inputUrl: string) {
    try {
        if (!inputUrl) {
            return { success: 0, error: 'URL inválida o vacía' };
        }

        const ytId = getYouTubeId(inputUrl);
        if (ytId) {
            const fallbackThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

            try {
                const res = await axios.get(inputUrl, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    timeout: 4000
                });
                const $ = cheerio.load(res.data);
                
                const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Video de YouTube';
                const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
                const scrapedImg = $('meta[property="og:image"]').attr('content') || $('link[itemprop="thumbnailUrl"]').attr('href');

                return {
                    success: 1,
                    meta: {
                        title,
                        description,
                        image: {
                            url: scrapedImg && scrapedImg.startsWith('http') ? scrapedImg : fallbackThumbnail,
                        }
                    }
                };
            } catch {
                return {
                    success: 1,
                    meta: {
                        title: "Video de YouTube",
                        description: "Haz clic para abrir el enlace del video directamente en YouTube.",
                        image: { url: fallbackThumbnail }
                    }
                };
            }
        }

        const res = await axios.get(inputUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-ES,es;q=0.9'
            },
            timeout: 5000
        });

        const $ = cheerio.load(res.data);
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        
        const imageUrl = $('meta[property="og:image"]').attr('content') || 
                         $('meta[name="twitter:image"]').attr('content') || 
                         $('link[rel="image_src"]').attr('href') || '';

        return {
            success: 1,
            meta: {
                title,
                description,
                image: { url: imageUrl }
            }
        };

    } catch (error) {
        console.error("Error en getLinkMetadata:", error);
        return { 
            success: 0, 
            error: 'No se pudo obtener la previsualización del enlace.' 
        };
    }
}