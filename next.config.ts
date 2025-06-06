
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // ATENÇÃO: As configurações abaixo são uma tentativa de fazer com que páginas
  // individuais funcionem melhor ao abrir o index.html diretamente via file:///.
  // ISSO NÃO É RECOMENDADO PARA PRODUÇÃO OU HOSPEDAGEM HTTP NORMAL.
  // O ROTEAMENTO ENTRE PÁGINAS (NAVEGAÇÃO POR LINKS INTERNOS) PROVAVELMENTE NÃO FUNCIONARÁ.
  assetPrefix: './', // Tenta usar caminhos relativos para assets
  trailingSlash: true, // Gera arquivos como /pagina/index.html

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Essencial para `output: 'export'` e para tentar compatibilidade com `file:///`
    // e `assetPrefix: './'`. Remove a otimização de imagem do Next.js.
    unoptimized: true,
    // A configuração de remotePatterns é para o build, mas não afetará a renderização
    // via file:/// para imagens externas a menos que haja internet.
    // Imagens locais devem estar na pasta `public` e ser referenciadas
    // de forma que o `assetPrefix: './'` funcione.
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
