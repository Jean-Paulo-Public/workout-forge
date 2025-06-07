
import type {NextConfig} from 'next';

const repositoryName = 'workout-forge';

const nextConfig: NextConfig = {
  output: 'export',
  // Configure basePath e assetPrefix se você estiver implantando em um subdiretório no GitHub Pages
  // Ex: https://<username>.github.io/<repositoryName>/
  // Se estiver implantando em um domínio raiz (ex: <username>.github.io ou um domínio personalizado),
  // essas linhas podem ser removidas ou comentadas.
  basePath: `/${repositoryName}`,
  assetPrefix: `/${repositoryName}/`,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
