
import type {NextConfig} from 'next';

// A variável repositoryName não é mais necessária aqui, pois basePath e assetPrefix serão removidos.

const nextConfig: NextConfig = {
  output: 'export',
  // As configurações basePath e assetPrefix foram removidas para o branch 'release'.
  // Elas são usadas quando o site é hospedado em um subdiretório (ex: GitHub Pages).
  // O Firebase Studio e o Firebase App Hosting geralmente servem o site da raiz.

  // Essencial para exportação estática funcionar sem um servidor Next.js otimizando imagens.
  // Mantido pois é útil para ambientes de hospedagem estática como o Firebase App Hosting.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
