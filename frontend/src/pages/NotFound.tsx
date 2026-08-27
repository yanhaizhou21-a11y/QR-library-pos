import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md space-y-8"
      >
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-secondary border border-border">
            <span className="text-6xl font-extrabold text-primary select-none">404</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan. Silakan kembali ke beranda untuk menjelajahi perpustakaan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button
              size="lg"
              className="h-12 px-6 rounded-xl font-bold gap-2 bg-primary hover:bg-primary-hover text-white"
            >
              <ArrowLeft className="size-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to="/katalog">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 rounded-xl font-semibold gap-2 border-border hover:bg-secondary"
            >
              <BookX className="size-4" />
              Lihat Katalog
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}