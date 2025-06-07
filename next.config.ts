
import type {NextConfig} from 'next';

const repositoryName = 'workout-forge'; // Nome do seu repositório

const nextConfig: NextConfig = {
  output: 'export',
  // Configure basePath e assetPrefix se você estiver implantando em um subdiretório no GitHub Pages
  // Ex: https://<username>.github.io/<repositoryName>/
  basePath: `/${repositoryName}`,
  assetPrefix: `/${repositoryName}/`, // A barra no final é importante.

  // Essencial para exportação estática funcionar sem um servidor Next.js otimizando imagens.
  // O GitHub Pages serve arquivos estáticos, não pode otimizar imagens em tempo real.
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
