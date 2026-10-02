export function validate(judul, nominal) {
  let judulError = '';
  let nominalError = '';

  if (!judul || !judul.trim()) {
    judulError = 'Judul wajib diisi';
  } else if (judul.trim().length > 100) {
    judulError = 'Judul maksimal 100 karakter';
  }

  if (!nominal || String(nominal).trim() === '') {
    nominalError = 'Nominal harus positif';
  } else if (!/^\d+$/.test(String(nominal).trim())) {
    nominalError = 'Nominal harus berupa angka';
  } else {
    const nilai = Number(nominal);
    if (!Number.isInteger(nilai) || nilai < 1) {
      nominalError = 'Nominal harus positif';
    } else if (nilai > 2147483647) {
      nominalError = 'Nominal terlalu besar';
    }
  }

  return {
    judulError,
    nominalError,
    isValid: !judulError && !nominalError,
  };
}

export const rupiah = (nilai) =>
  `Rp ${String(Number(nilai || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export function tanggalLokal(value) {
  if (!value) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.split('-').reverse().join('/');
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function terbilang(n) {
  const angka = Number(n);
  if (!angka || isNaN(angka) || angka <= 0) return '';
  const satuan = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];
  function konversi(x) {
    if (x < 12) return satuan[x];
    if (x < 20) return konversi(x - 10) + ' belas';
    if (x < 100)
      return konversi(Math.floor(x / 10)) + ' puluh ' + satuan[x % 10];
    if (x < 200) return 'seratus ' + konversi(x - 100);
    if (x < 1000)
      return konversi(Math.floor(x / 100)) + ' ratus ' + konversi(x % 100);
    if (x < 2000) return 'seribu ' + konversi(x - 1000);
    if (x < 1000000)
      return konversi(Math.floor(x / 1000)) + ' ribu ' + konversi(x % 1000);
    if (x < 1000000000)
      return (
        konversi(Math.floor(x / 1000000)) +
        ' juta ' +
        konversi(x % 1000000)
      );
    return (
      konversi(Math.floor(x / 1000000000)) +
      ' milyar ' +
      konversi(x % 1000000000)
    );
  }
  const hasil = konversi(Math.floor(angka)).replace(/\s+/g, ' ').trim();
  return hasil ? hasil.charAt(0).toUpperCase() + hasil.slice(1) + ' rupiah' : '';
}