import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, BackHandler, FlatList,
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { api } from './src/api';
import { rupiah, tanggalLokal, validate } from './src/helpers';

function Tombol({ title, onPress, disabled = false, secondary = false }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled}
      onPress={onPress}
      style={[s.button, secondary && s.buttonSecondary, disabled && s.disabled]}>
      <Text style={[s.buttonText, secondary && s.buttonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

export default function App() {
  return <SafeAreaProvider><Utama /></SafeAreaProvider>;
}

function Utama() {
  const [screen, setScreen] = useState('list');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const lock = useRef(false);

  async function load() {
    if (lock.current) return;
    lock.current = true; setLoading(true); setError(''); setNotice('');
    try {
      const rows = await api.list();
      if (!Array.isArray(rows)) throw new Error('Daftar harus berupa array');
      setItems(rows);
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function back() {
    if (lock.current) return;
    setError('');
    setScreen(screen === 'edit' ? 'detail' : 'list');
  }
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'list' && !lock.current) return false;
      back(); return true;
    });
    return () => sub.remove();
  }, [screen]);

  async function openDetail(id) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      setSelected(await api.detail(id)); setScreen('detail');
    } catch (e) {
      setError(e.status === 404
        ? 'Data tidak ditemukan. Pengeluaran ini mungkin sudah dihapus. Tekan Muat ulang.'
        : e.message);
    }
    finally { lock.current = false; setBusy(false); }
  }
  async function openCreate() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const rows = await api.categories();
      if (!Array.isArray(rows)) throw new Error('Kategori harus berupa array');
      setCategories(rows); setJudul(''); setNominal('');
      setCategoryId(null); setScreen('create');
    } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }
  function openEdit() {
    setJudul(selected.judul); setNominal(String(selected.nominal));
    setError(''); setScreen('edit');
  }

  async function save() {
    if (lock.current) return;
    const pesan = validate(judul, nominal);
    if (pesan) { setError(pesan); return; }
    lock.current = true; setBusy(true); setError('');
    const isCreate = screen === 'create';
    let saved = false;
    try {
      const body = { judul: judul.trim(), nominal: Number(nominal) };
      if (isCreate) {
        await api.create({ ...body, id_kategori: categoryId });
      } else {
        await api.update(selected.id, body);
      }
      saved = true;
      setItems([]); setScreen('list'); setSelected(null);
      const rows = await api.list();
      if (!Array.isArray(rows)) throw new Error('Daftar harus berupa array');
      setItems(rows);
      setNotice(isCreate ? 'Pengeluaran berhasil ditambahkan'
        : 'Pengeluaran berhasil diperbarui');
    } catch (e) {
      setError(saved ? `Data tersimpan. Muat ulang daftar: ${e.message}`
        : `${e.message}. Jika koneksi putus, cek daftar sebelum mengulang.`);
    } finally { lock.current = false; setBusy(false); }
  }

  async function remove() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    let deleted = false;
    try {
      await api.remove(selected.id); deleted = true;
      setItems([]); setSelected(null); setScreen('list');
      const rows = await api.list();
      if (!Array.isArray(rows)) throw new Error('Daftar harus berupa array');
      setItems(rows);
      setNotice('Data berhasil dihapus');
    } catch (e) {
      setError(deleted ? `Data terhapus. Muat ulang daftar: ${e.message}`
        : e.message);
    } finally { lock.current = false; setBusy(false); }
  }

  function confirmDelete() {
    Alert.alert('Hapus pengeluaran?',
      `${selected.judul} - ${rupiah(selected.nominal)} akan dihapus permanen.`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: remove },
      ]);
  }

  const disabled = loading || busy;
  const titles = { list: 'Pengeluaran', create: 'Tambah pengeluaran',
    detail: 'Detail pengeluaran', edit: 'Ubah pengeluaran' };

  // Filter kategori dibentuk dari data API, bukan ditulis manual.
  const names = [...new Set(items.map((i) => i.kategori).filter(Boolean))];
  const active = (filter === 'Semua' || filter === 'Tanpa kategori'
    || names.includes(filter)) ? filter : 'Semua';
  const shown = items.filter((i) =>
    active === 'Semua' ? true
      : active === 'Tanpa kategori' ? !i.kategori : i.kategori === active);
  const total = shown.reduce((a, i) => a + Number(i.nominal || 0), 0);
  const pills = ['Semua', ...names, 'Tanpa kategori'];

  const listHeader = (
    <View>
      <View style={s.summary}>
        <Text style={s.summaryLabel}>
          {active === 'Semua' ? 'Total Pengeluaran' : `Total ${active}`}
        </Text>
        <Text style={s.summaryValue}>{rupiah(total)}</Text>
        <Text style={s.summaryNote}>{shown.length} transaksi tercatat</Text>
      </View>
      <Tombol title="+ Tambah Pengeluaran Baru" onPress={openCreate}
        disabled={disabled} />
      <Text style={s.section}>Daftar Pengeluaran</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.pillRow}>
        {pills.map((p) => (
          <Pressable key={p} onPress={() => setFilter(p)}
            style={[s.pill, active === p && s.pillActive]}>
            <Text style={[s.pillText, active === p && s.pillTextActive]}>{p}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const listEmpty = disabled ? null : error && !items.length ? (
    <View style={s.stateBox}>
      <Text style={s.stateTitle}>Gagal memuat data</Text>
      <Text style={s.stateText}>Periksa koneksi ke server lalu coba lagi.</Text>
      <Tombol title="Coba lagi" onPress={load} />
    </View>
  ) : (
    <View style={s.stateBox}>
      <Text style={s.stateTitle}>Belum ada pengeluaran</Text>
      <Text style={s.stateText}>Tambahkan pengeluaran pertama</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={s.heading}>{titles[screen]}</Text>
        {screen !== 'list' && <Tombol title="Kembali" secondary
          onPress={back} disabled={disabled} />}
        {!!notice && screen === 'list' && <Text style={s.notice}>{notice}</Text>}
        {!!error && !(screen === 'list' && !items.length) &&
          <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {disabled && <ActivityIndicator accessibilityLabel="Memuat data" />}

        {screen === 'list' && <FlatList
          data={shown} keyExtractor={(item) => String(item.id)}
          refreshing={loading} onRefresh={load}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={<Tombol title="Muat ulang" secondary
            onPress={load} disabled={disabled} />}
          renderItem={({ item }) => (
            <Pressable style={s.card} accessibilityRole="button"
              disabled={disabled} onPress={() => openDetail(item.id)}>
              <View style={s.cardTop}>
                <Text style={s.cardTitle}>{item.judul}</Text>
                <Text style={s.cardAmount}>{rupiah(item.nominal)}</Text>
              </View>
              <Text style={s.meta}>{item.kategori || 'Tanpa kategori'}</Text>
              <Text style={s.meta}>{tanggalLokal(item.tanggal)}</Text>
              <Text style={s.link}>Lihat detail</Text>
            </Pressable>
          )} />}

        {screen === 'detail' && selected && <ScrollView>
          <View style={s.card}>
            <Text style={s.meta}>TRANSAKSI</Text>
            <Text style={s.cardTitle}>{selected.judul}</Text>
            <Text style={s.cardAmount}>{rupiah(selected.nominal)}</Text>
            <View style={s.sep} />
            <Text style={s.meta}>Tanggal</Text>
            <Text>{tanggalLokal(selected.tanggal)}</Text>
            <Text style={s.meta}>Kategori</Text>
            <Text>{selected.id_kategori != null
              ? `ID kategori ${selected.id_kategori}` : 'Tanpa kategori'}</Text>
            <Text style={s.meta}>Catatan</Text>
            <Text style={{ fontStyle: 'italic' }}>
              {selected.catatan || 'Belum ada catatan'}</Text>
          </View>
          <Text style={s.meta}>Informasi detail hanya dibaca</Text>
          <Tombol title="Ubah" onPress={openEdit} disabled={disabled} />
          <Tombol title="Hapus" onPress={confirmDelete} disabled={disabled}
            secondary />
        </ScrollView>}

        {(screen === 'create' || screen === 'edit') && <ScrollView
          keyboardShouldPersistTaps="handled">
          <Text style={s.label}>Judul</Text>
          <TextInput style={s.input} value={judul} onChangeText={setJudul}
            accessibilityLabel="Judul" editable={!busy} maxLength={100}
            placeholder="Contoh: Makan siang" />
          <Text style={s.label}>Nominal rupiah</Text>
          <TextInput style={s.input} value={nominal}
            onChangeText={setNominal} keyboardType="number-pad"
            accessibilityLabel="Nominal rupiah" editable={!busy}
            placeholder="Contoh: 20000" />
          {screen === 'create' ? <>
            <Text style={s.label}>Kategori opsional</Text>
            {[{ id: null, nama: 'Tanpa kategori' }, ...categories].map((k) => (
              <Pressable key={String(k.id)} accessibilityRole="radio"
                accessibilityState={{ checked: categoryId === k.id }}
                disabled={busy} onPress={() => setCategoryId(k.id)}
                style={[s.choice, categoryId === k.id && s.chosen]}>
                <Text>{categoryId === k.id ? '(x) ' : '( ) '}{k.nama}</Text>
              </Pressable>
            ))}
            <Text style={s.meta}>Tanggal otomatis dari server</Text>
          </> : <View style={s.locked}>
            <Text style={s.cardTitle}>Data terkunci</Text>
            <Text style={s.meta}>
              Kategori, tanggal, dan catatan tidak dapat diubah.</Text>
          </View>}
          <Tombol title={busy ? 'Menyimpan...' : screen === 'edit'
            ? 'Simpan perubahan' : 'Simpan'}
            onPress={save} disabled={disabled} />
        </ScrollView>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  heading: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  button: { backgroundColor: '#0F766E', padding: 12, minHeight: 48,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    marginVertical: 6 },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#0F766E' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonTextSecondary: { color: '#0F766E' },
  disabled: { opacity: 0.5 },
  summary: { padding: 16, backgroundColor: '#0F766E', borderRadius: 12,
    marginBottom: 8, gap: 4 },
  summaryLabel: { color: '#CCFBF1', fontSize: 14 },
  summaryValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  summaryNote: { color: '#CCFBF1', fontSize: 13 },
  section: { fontSize: 18, fontWeight: '600', color: '#0F172A',
    marginTop: 16, marginBottom: 8 },
  pillRow: { marginBottom: 8, flexGrow: 0 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF',
    marginRight: 8 },
  pillActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  pillText: { color: '#334155' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '600' },
  card: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8,
    borderWidth: 1, borderColor: '#CBD5E1', marginVertical: 8, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardAmount: { fontSize: 18, fontWeight: '700', color: '#0F766E' },
  meta: { color: '#64748B', fontSize: 14 },
  link: { color: '#0F766E', fontWeight: '600' },
  sep: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  label: { fontSize: 16, marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#64748B', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  choice: { padding: 12, minHeight: 48, marginBottom: 8,
    borderWidth: 1, borderColor: '#64748B', borderRadius: 8 },
  chosen: { backgroundColor: '#CCFBF1', borderColor: '#0F766E' },
  locked: { padding: 16, backgroundColor: '#F1F5F9', borderRadius: 8,
    marginTop: 16, gap: 4 },
  notice: { backgroundColor: '#CCFBF1', color: '#0F766E', padding: 12,
    borderRadius: 8, marginBottom: 8, fontWeight: '600' },
  error: { color: '#B91C1C', marginVertical: 8, fontSize: 16 },
  stateBox: { alignItems: 'center', padding: 24, gap: 8 },
  stateTitle: { fontSize: 18, fontWeight: '600' },
  stateText: { color: '#64748B', textAlign: 'center' },
});