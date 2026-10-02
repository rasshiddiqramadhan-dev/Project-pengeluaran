import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { api } from './src/api';
import { rupiah, tanggalLokal, terbilang, validate } from './src/helpers';
import { theme } from './src/theme';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BackIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClearIcon,
  CutleryIcon,
  FileSearchNotFoundIcon,
  GraduationCapIcon,
  HeaderUserIcon,
  InfoIcon,
  LightbulbIcon,
  LockIcon,
  NoCategoryIcon,
  PlusIcon,
  ReceiptIcon,
  ReloadIcon,
  SaveIcon,
  SuccessIcon,
  TheaterMasksIcon,
  TrashIcon,
  TransportIcon,
} from './src/Icons';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={s.loadingRoot}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Utama />
    </SafeAreaProvider>
  );
}

function getCategoryIcon(nama, color = '#36665A', size = 16) {
  const n = (nama || '').toLowerCase();
  if (n.includes('makan')) return <CutleryIcon width={size} height={size} color={color} />;
  if (n.includes('didik') || n.includes('buku') || n.includes('kuliah'))
    return <GraduationCapIcon width={size} height={size} color={color} />;
  if (n.includes('trans') || n.includes('bensin') || n.includes('kendaraan'))
    return <TransportIcon width={size} height={size} color={color} />;
  if (n.includes('hibur') || n.includes('main') || n.includes('film'))
    return <TheaterMasksIcon width={size} height={size} color={color} />;
  return <NoCategoryIcon width={size} height={size} color={color} />;
}

function Utama() {
  const [screen, setScreen] = useState('list');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedNotFound, setSelectedNotFound] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('Semua');

  // Form states
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [catatan, setCatatan] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [formErrors, setFormErrors] = useState({ judulError: '', nominalError: '' });

  // Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rekapOpen, setRekapOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(api.getBaseUrl());
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const lock = useRef(false);

  async function load() {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError('');
    try {
      const [pengeluaranRows, kategoriRows] = await Promise.all([
        api.list(),
        api.categories().catch(() => []),
      ]);
      if (!Array.isArray(pengeluaranRows)) throw new Error('Daftar harus berupa array');
      setItems(pengeluaranRows);
      if (Array.isArray(kategoriRows) && kategoriRows.length > 0) {
        setCategories(kategoriRows);
      }
    } catch (e) {
      setError(e.message || 'Gagal terhubung ke basis data');
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function back() {
    if (lock.current) return;
    setError('');
    setFormErrors({ judulError: '', nominalError: '' });
    setSelectedNotFound(false);
    if (screen === 'pick_category') {
      setScreen('create');
    } else if (screen === 'edit') {
      setScreen('detail');
    } else {
      setScreen('list');
    }
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'list' && !lock.current) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  async function openDetail(id) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    setLastSelectedId(id);
    setSelectedNotFound(false);
    try {
      const data = await api.detail(id);
      setSelected(data);
      setScreen('detail');
    } catch (e) {
      setSelected(null);
      setSelectedNotFound(true);
      setScreen('detail');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function openCreate() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    setFormErrors({ judulError: '', nominalError: '' });
    try {
      const rows = await api.categories().catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) setCategories(rows);
      setJudul('');
      setNominal('');
      setCatatan('');
      setCategoryId(null);
      setScreen('create');
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function openEdit() {
    if (!selected) return;
    setJudul(selected.judul || '');
    setNominal(String(selected.nominal || ''));
    setCatatan(selected.catatan || '');
    setError('');
    setFormErrors({ judulError: '', nominalError: '' });
    setScreen('edit');
  }

  async function save() {
    if (lock.current) return;
    const val = validate(judul, nominal);
    if (!val.isValid) {
      setFormErrors({
        judulError: val.judulError,
        nominalError: val.nominalError,
      });
      return;
    }
    setFormErrors({ judulError: '', nominalError: '' });
    lock.current = true;
    setBusy(true);
    setError('');
    const isCreate = screen === 'create';
    try {
      const body = {
        judul: judul.trim(),
        nominal: Number(nominal),
      };
      if (isCreate) {
        body.id_kategori = categoryId;
        if (catatan.trim()) body.catatan = catatan.trim();
        await api.create(body);
      } else {
        await api.update(selected.id, body);
      }
      setItems([]);
      setScreen('list');
      setSelected(null);
      const rows = await api.list();
      if (Array.isArray(rows)) setItems(rows);
      setNotice(
        isCreate
          ? 'Pengeluaran berhasil ditambahkan'
          : 'Pengeluaran berhasil diperbarui'
      );
    } catch (e) {
      setError(e.message || 'Gagal menyimpan ke basis data.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await api.remove(selected.id);
      setItems([]);
      setSelected(null);
      setScreen('list');
      const rows = await api.list();
      if (Array.isArray(rows)) setItems(rows);
      setNotice('Data berhasil dihapus');
    } catch (e) {
      setError(e.message || 'Gagal menghapus data.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function handleTestConnection(targetUrl) {
    const urlToTest = targetUrl || serverUrlInput;
    setTesting(true);
    setTestResult(null);
    try {
      api.setBaseUrl(urlToTest);
      const rows = await api.list();
      setTestResult({
        success: true,
        message: `Tersambung ke backend db_pengeluaran! (${rows.length} transaksi)`,
      });
      load();
    } catch (e) {
      setTestResult({
        success: false,
        message: `Gagal tersambung: ${e.message}. Pastikan XAMPP MySQL & backend menyala.`,
      });
    } finally {
      setTesting(false);
    }
  }

  const disabled = loading || busy;

  // Categories list
  const categoryNamesFromItems = items.map((i) => i.kategori).filter(Boolean);
  const categoryNamesFromDb = categories.map((c) => c.nama);
  const allCategoryNames = [
    ...new Set([...categoryNamesFromDb, ...categoryNamesFromItems]),
  ];

  const active =
    filter === 'Semua' ||
    filter === 'Tanpa kategori' ||
    allCategoryNames.includes(filter)
      ? filter
      : 'Semua';

  const shown = items.filter((i) =>
    active === 'Semua'
      ? true
      : active === 'Tanpa kategori'
      ? !i.kategori
      : i.kategori === active
  );

  const total = shown.reduce((a, i) => a + Number(i.nominal || 0), 0);
  const pills = ['Semua', ...allCategoryNames, 'Tanpa kategori'];

  // Current selected category object in create form
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  // Today's formatted date string for hero card
  const todayFormatted = tanggalLokal(new Date());

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFB" />

      {/* Top Header Bar */}
      <View style={s.appHeader}>
        <Text style={s.appHeaderTitle}>Pengeluaran</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setServerUrlInput(api.getBaseUrl());
            setTestResult(null);
            setSettingsOpen(true);
          }}
          style={s.headerAvatarBtn}
        >
          <HeaderUserIcon width={14} height={14} color="#FFFFFF" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Notice Banner (Figma: Data Berhasil Dihapus / Ditambahkan) */}
        {!!notice && (
          notice === 'Data berhasil dihapus' ? (
            <View style={s.noticeBannerDeleted}>
              <InfoIcon width={16} height={16} color="#0F172A" />
              <Text style={s.noticeTextDeleted}>Data berhasil dihapus</Text>
            </View>
          ) : (
            <View style={s.noticeBanner}>
              <SuccessIcon width={18} height={18} color="#166534" />
              <Text style={s.noticeText}>{notice}</Text>
            </View>
          )
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: PENGELUARAN - BERANDA                          */}
        {/* ======================================================== */}
        {screen === 'list' && (
          // Case 1: Status Error (Figma: Daftar Pengeluaran - Status Error)
          error && items.length === 0 ? (
            <View style={s.centerStateContainer}>
              <View style={s.errorIconCircle}>
                <AlertCircleIcon width={36} height={36} color="#BA1A1A" />
              </View>
              <Text style={s.stateTitle}>Gagal memuat data</Text>
              <Text style={s.stateSubtitle}>
                Periksa koneksi ke server lalu coba lagi.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={load}
                style={s.btnStateAction}
              >
                <ReloadIcon width={14} height={14} color="#FFFFFF" />
                <Text style={s.btnStateActionText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : !loading && items.length === 0 ? (
            // Case 2: Daftar Kosong (Figma: Daftar Pengeluaran - Kosong)
            <View style={s.centerStateContainer}>
              <View style={s.emptyIconCircle}>
                <ReceiptIcon width={32} height={32} color="#64748B" />
              </View>
              <Text style={s.stateTitle}>Belum ada pengeluaran</Text>
              <Text style={s.stateSubtitle}>
                {'Tambahkan pengeluaran pertama\nAnda.'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={openCreate}
                style={s.btnStateAction}
              >
                <PlusIcon width={14} height={14} color="#FFFFFF" />
                <Text style={s.btnStateActionText}>Tambah pengeluaran</Text>
              </Pressable>
            </View>
          ) : (
            // Case 3: List Pengeluaran Normal (Figma: Pengeluaran - Beranda)
            <FlatList
              data={shown}
              keyExtractor={(item) => String(item.id)}
              refreshing={loading}
              onRefresh={load}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={s.listHeaderContainer}>
                  {/* Hero Card: Total Pengeluaran Hari Ini (Figma: #2:178) */}
                  <View style={s.heroCard}>
                    <Text style={s.heroCardLabel}>Total Pengeluaran Hari Ini</Text>
                    <Text style={s.heroCardAmount}>{rupiah(total)}</Text>
                    <View style={s.heroCardDivider} />
                    <View style={s.heroCardBottomRow}>
                      <ReceiptIcon width={15} height={15} color="#64748B" />
                      <Text style={s.heroCardSubtext}>
                        {shown.length} transaksi tercatat pada {todayFormatted}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons: + Tambah Pengeluaran Baru & Muat Ulang */}
                  <View style={s.actionBtnGroup}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={disabled}
                      onPress={openCreate}
                      style={[s.btnPrimary, disabled && s.disabled]}
                    >
                      <PlusIcon width={14} height={14} color="#FFFFFF" />
                      <Text style={s.btnPrimaryText}>Tambah Pengeluaran Baru</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      disabled={disabled}
                      onPress={load}
                      style={[s.btnReload, disabled && s.disabled]}
                    >
                      <ReloadIcon width={14} height={14} color={theme.colors.primary} />
                      <Text style={s.btnReloadText}>Muat ulang</Text>
                    </Pressable>
                  </View>

                  {/* Section Title & Tag "HARI INI" */}
                  <View style={s.sectionHeaderRow}>
                    <Text style={s.sectionTitle}>Daftar Pengeluaran</Text>
                    <Text style={s.sectionTag}>HARI INI</Text>
                  </View>

                  {/* Category Filter Pills */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={s.pillScroll}
                    contentContainerStyle={s.pillScrollContent}
                  >
                    {pills.map((p) => {
                      const isSelected = active === p;
                      return (
                        <Pressable
                          key={p}
                          onPress={() => setFilter(p)}
                          style={[s.pill, isSelected && s.pillActive]}
                        >
                          {isSelected && (
                            <CheckIcon width={12} height={12} color="#FFFFFF" />
                          )}
                          <Text
                            style={[
                              s.pillText,
                              isSelected && s.pillTextActive,
                            ]}
                          >
                            {p}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              }
              renderItem={({ item }) => (
                <View style={s.itemCard}>
                  <View style={s.itemTopRow}>
                    <Text style={s.itemTitle} numberOfLines={1}>
                      {item.judul}
                    </Text>
                    <View style={s.itemBadge}>
                      <Text style={s.itemBadgeText}>
                        {item.kategori || 'Tanpa kategori'}
                      </Text>
                    </View>
                  </View>

                  <Text style={s.itemAmount}>{rupiah(item.nominal)}</Text>

                  <View style={s.itemBottomRow}>
                    <Text style={s.itemDate}>{tanggalLokal(item.tanggal)}</Text>
                    <Pressable
                      accessibilityRole="button"
                      disabled={disabled}
                      onPress={() => openDetail(item.id)}
                      style={s.detailLink}
                    >
                      <Text style={s.detailLinkText}>Lihat detail</Text>
                      <ChevronRightIcon width={12} height={12} color={theme.colors.primary} />
                    </Pressable>
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View style={s.listFooterWrap}>
                  {/* Summary Card: Total Terpilih (Figma: #2:653) */}
                  <View style={s.summaryCard}>
                    <View>
                      <Text style={s.summaryCardLabel}>Total Terpilih</Text>
                      <Text style={s.summaryCardCount}>{shown.length} Transaksi</Text>
                    </View>
                    <Text style={s.summaryCardAmount}>
                      {shown.length === 0 ? 'Rp.0' : rupiah(total)}
                    </Text>
                  </View>

                  {/* Button: Lihat Rekapitulasi Bulan Ini (Figma: #2:186) */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setRekapOpen(true)}
                    style={s.btnRekap}
                  >
                    <CalendarIcon width={16} height={16} color="#0F172A" />
                    <Text style={s.btnRekapText}>Lihat Rekapitulasi Bulan Ini</Text>
                  </Pressable>
                </View>
              }
            />
          )
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: DETAIL PENGELUARAN                             */}
        {/* ======================================================== */}
        {screen === 'detail' && (
          selectedNotFound || !selected ? (
            // Case 2A: Detail Pengeluaran - Data Tidak Ditemukan (Figma 404)
            <ScrollView
              style={s.flex}
              contentContainerStyle={s.detailScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                accessibilityRole="button"
                onPress={back}
                style={s.btnSubBack}
              >
                <BackIcon width={14} height={14} color="#0F172A" />
                <Text style={s.btnSubBackText}>Kembali</Text>
              </Pressable>

              <Text style={s.pageHeading}>Detail pengeluaran</Text>

              <View style={s.centerNotFoundContainer}>
                <View style={s.notFoundIconCircle}>
                  <FileSearchNotFoundIcon width={56} height={56} />
                </View>
                <Text style={s.notFoundTitle}>Data tidak ditemukan</Text>
                <Text style={s.notFoundSubtitle}>
                  {'Pengeluaran ini mungkin sudah\ndihapus atau tautan yang Anda akses\nsudah tidak berlaku.'}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={back}
                  style={[s.btnPrimary, s.fullWidth, s.actionMarginBottom]}
                >
                  <ArrowLeftIcon width={16} height={16} color="#FFFFFF" />
                  <Text style={s.btnPrimaryText}>Kembali ke Riwayat</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => lastSelectedId && openDetail(lastSelectedId)}
                  style={[s.btnOutlinePlain, s.fullWidth]}
                >
                  <ReloadIcon width={14} height={14} color="#0F172A" />
                  <Text style={s.btnOutlinePlainText}>Muat Ulang Halaman</Text>
                </Pressable>

                <View style={s.notFoundTipBox}>
                  <LightbulbIcon width={16} height={16} color={theme.colors.primary} />
                  <Text style={s.notFoundTipText}>
                    Catatan transaksi yang terhapus tidak dapat dipulihkan kembali ke
                    pembukuan.
                  </Text>
                </View>
              </View>
            </ScrollView>
          ) : (
            // Case 2B: Detail Pengeluaran Normal (Figma: #2:678)
            <ScrollView
              style={s.flex}
              contentContainerStyle={s.detailScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={back}
                style={s.btnSubBack}
              >
                <BackIcon width={14} height={14} color="#0F172A" />
                <Text style={s.btnSubBackText}>Kembali</Text>
              </Pressable>

              <Text style={s.pageHeading}>Detail pengeluaran</Text>

              {/* Detail Card */}
              <View style={s.detailCard}>
                <Text style={s.detailCardTag}>TRANSAKSI</Text>
                <Text style={s.detailCardTitle}>{selected.judul}</Text>
                <Text style={s.detailCardAmount}>{rupiah(selected.nominal)}</Text>

                <View style={s.detailCardDivider} />

                <View style={s.detailRow}>
                  <Text style={s.detailRowLabel}>Tanggal</Text>
                  <Text style={s.detailRowValue}>
                    {tanggalLokal(selected.tanggal)}
                  </Text>
                </View>

                <View style={s.detailRow}>
                  <Text style={s.detailRowLabel}>Kategori</Text>
                  <View style={s.detailCategoryBadge}>
                    {getCategoryIcon(selected.kategori, theme.colors.primary, 13)}
                    <Text style={s.detailCategoryBadgeText}>
                      {selected.kategori ||
                        (selected.id_kategori != null
                          ? `ID kategori ${selected.id_kategori}`
                          : 'Tanpa kategori')}
                    </Text>
                  </View>
                </View>

                <View style={s.detailNoteSection}>
                  <Text style={s.detailRowLabel}>Catatan</Text>
                  <View style={s.detailNoteBox}>
                    <Text
                      style={[
                        s.detailNoteText,
                        !selected.catatan && s.detailNoteItalic,
                      ]}
                    >
                      {selected.catatan || 'Belum ada catatan'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={s.detailHelperRow}>
                <InfoIcon width={14} height={14} color="#64748B" />
                <Text style={s.detailHelperText}>
                  Informasi detail hanya dibaca
                </Text>
              </View>

              {/* Actions: Ubah & Hapus */}
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={openEdit}
                style={[s.btnPrimary, s.actionMarginBottom, disabled && s.disabled]}
              >
                <Text style={s.btnPrimaryText}>Ubah</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => setDeleteConfirmOpen(true)}
                style={[s.btnOutlineDelete, disabled && s.disabled]}
              >
                <Text style={s.btnOutlineDeleteText}>Hapus</Text>
              </Pressable>
            </ScrollView>
          )
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: UBAH PENGELUARAN                               */}
        {/* ======================================================== */}
        {screen === 'edit' && selected && (
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.formScrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Sub-Header: Kembali & ID TRX Badge (Figma: #2:496) */}
            <View style={s.subHeaderRow}>
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={back}
                style={s.btnSubBack}
              >
                <BackIcon width={14} height={14} color="#0F172A" />
                <Text style={s.btnSubBackText}>Kembali</Text>
              </Pressable>
              <View style={s.trxBadge}>
                <Text style={s.trxBadgeText}>
                  ID #TRX-{String(selected.id).padStart(4, '0')}
                </Text>
              </View>
            </View>

            <Text style={s.pageHeading}>Ubah pengeluaran</Text>
            <Text style={s.pageSubHeading}>
              Perbarui rincian pengeluaran harian Anda.
            </Text>

            {/* Input Judul with Clear Button */}
            <View style={s.formGroup}>
              <View style={s.formLabelRow}>
                <Text style={s.formLabel}>Judul Pengeluaran</Text>
                <Text style={s.formLabelHint}>Wajib diisi</Text>
              </View>
              <View
                style={[
                  s.inputWithClearWrap,
                  !!formErrors.judulError && s.inputErrorBorder,
                  busy && s.inputDisabled,
                ]}
              >
                <TextInput
                  style={s.inputWithClearText}
                  value={judul}
                  onChangeText={(t) => {
                    setJudul(t);
                    if (formErrors.judulError)
                      setFormErrors((prev) => ({ ...prev, judulError: '' }));
                  }}
                  editable={!busy}
                  maxLength={100}
                  placeholder="Makan siang"
                  placeholderTextColor="#94A3B8"
                />
                {!!judul && !busy && (
                  <Pressable onPress={() => setJudul('')} hitSlop={8}>
                    <ClearIcon width={16} height={16} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
              {!!formErrors.judulError && (
                <View style={s.errorInlineRow}>
                  <AlertCircleIcon width={13} height={13} color="#BA1A1A" />
                  <Text style={s.errorInlineText}>{formErrors.judulError}</Text>
                </View>
              )}
            </View>

            {/* Input Nominal with "Rp" Prefix & Terbilang */}
            <View style={s.formGroup}>
              <View style={s.formLabelRow}>
                <Text style={s.formLabel}>Nominal Rupiah</Text>
                <Text style={s.formLabelHint}>Hanya angka</Text>
              </View>
              <View
                style={[
                  s.nominalInputWrap,
                  !!formErrors.nominalError && s.inputErrorBorder,
                  busy && s.inputDisabled,
                ]}
              >
                <View style={s.nominalPrefixBox}>
                  <Text style={s.nominalPrefixText}>Rp</Text>
                </View>
                <TextInput
                  style={s.nominalTextInput}
                  value={nominal}
                  onChangeText={(t) => {
                    setNominal(t.replace(/[^0-9]/g, ''));
                    if (formErrors.nominalError)
                      setFormErrors((prev) => ({ ...prev, nominalError: '' }));
                  }}
                  keyboardType="number-pad"
                  editable={!busy}
                  placeholder="22000"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              {!!formErrors.nominalError ? (
                <View style={s.errorInlineRow}>
                  <AlertCircleIcon width={13} height={13} color="#BA1A1A" />
                  <Text style={s.errorInlineText}>{formErrors.nominalError}</Text>
                </View>
              ) : !!terbilang(nominal) ? (
                <View style={s.terbilangRow}>
                  <CheckIcon width={13} height={13} color={theme.colors.primary} />
                  <Text style={s.terbilangText}>{terbilang(nominal)}</Text>
                </View>
              ) : null}
            </View>

            {/* Data Terkunci Card (Figma: #2:496) */}
            <View style={s.lockedCard}>
              <View style={s.lockedCardHeader}>
                <View style={s.lockedTitleLeft}>
                  <LockIcon width={15} height={15} color="#0F172A" />
                  <Text style={s.lockedTitleText}>Data terkunci</Text>
                </View>
                <View style={s.lockedBadge}>
                  <Text style={s.lockedBadgeText}>Tidak dapat diubah</Text>
                </View>
              </View>

              <View style={s.lockedRow}>
                <Text style={s.lockedLabel}>Kategori</Text>
                <View style={s.lockedCategoryBadge}>
                  {getCategoryIcon(selected.kategori, theme.colors.primary, 13)}
                  <Text style={s.lockedCategoryText}>
                    {selected.kategori || 'Tanpa kategori'}
                  </Text>
                </View>
              </View>

              <View style={s.lockedRow}>
                <Text style={s.lockedLabel}>Tanggal</Text>
                <View style={s.lockedDateRow}>
                  <CalendarIcon width={13} height={13} color="#0F172A" />
                  <Text style={s.lockedValue}>
                    {tanggalLokal(selected.tanggal)}
                  </Text>
                </View>
              </View>

              <View style={s.lockedRow}>
                <Text style={s.lockedLabel}>Catatan</Text>
                <Text style={s.lockedValue}>
                  {selected.catatan || 'Belum ada catatan'}
                </Text>
              </View>

              <View style={s.lockedDivider} />

              <View style={s.lockedFooterRow}>
                <InfoIcon width={13} height={13} color="#64748B" />
                <Text style={s.lockedFooterText}>
                  Kategori dan tanggal transaksi diarsip secara permanen untuk audit
                  saldo kas.
                </Text>
              </View>
            </View>

            {/* Save and Delete Actions */}
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={save}
              style={[
                s.btnPrimary,
                s.actionMarginBottom,
                busy && s.btnPrimaryBusy,
              ]}
            >
              {busy ? (
                <View style={s.busyRow}>
                  <ActivityIndicator size="small" color="#64748B" />
                  <Text style={s.busyText}>Menyimpan...</Text>
                </View>
              ) : (
                <View style={s.btnIconRow}>
                  <SaveIcon width={16} height={16} color="#FFFFFF" />
                  <Text style={s.btnPrimaryText}>Simpan perubahan</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => setDeleteConfirmOpen(true)}
              style={[s.btnDangerOutline, disabled && s.disabled]}
            >
              <TrashIcon width={16} height={16} color="#BA1A1A" />
              <Text style={s.btnDangerOutlineText}>Hapus pengeluaran ini</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: TAMBAH PENGELUARAN                             */}
        {/* ======================================================== */}
        {screen === 'create' && (
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.formScrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={back}
              style={s.btnSubBack}
            >
              <BackIcon width={14} height={14} color="#0F172A" />
              <Text style={s.btnSubBackText}>Kembali</Text>
            </Pressable>

            <Text style={s.pageHeading}>Tambah pengeluaran</Text>

            {/* Judul Field */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Judul</Text>
              <TextInput
                style={[
                  s.inputBase,
                  !!formErrors.judulError && s.inputErrorBorder,
                  busy && s.inputDisabled,
                ]}
                value={judul}
                onChangeText={(t) => {
                  setJudul(t);
                  if (formErrors.judulError)
                    setFormErrors((prev) => ({ ...prev, judulError: '' }));
                }}
                editable={!busy}
                maxLength={100}
                placeholder="Contoh: Makan siang"
                placeholderTextColor="#94A3B8"
              />
              {!!formErrors.judulError && (
                <View style={s.errorInlineRow}>
                  <AlertCircleIcon width={13} height={13} color="#BA1A1A" />
                  <Text style={s.errorInlineText}>{formErrors.judulError}</Text>
                </View>
              )}
            </View>

            {/* Nominal Rupiah Field */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Nominal rupiah</Text>
              <View
                style={[
                  s.nominalInputWrap,
                  !!formErrors.nominalError && s.inputErrorBorder,
                  busy && s.inputDisabled,
                ]}
              >
                <View style={s.nominalPrefixBox}>
                  <Text style={s.nominalPrefixText}>Rp</Text>
                </View>
                <TextInput
                  style={s.nominalTextInput}
                  value={nominal}
                  onChangeText={(t) => {
                    setNominal(t.replace(/[^0-9]/g, ''));
                    if (formErrors.nominalError)
                      setFormErrors((prev) => ({ ...prev, nominalError: '' }));
                  }}
                  keyboardType="number-pad"
                  editable={!busy}
                  placeholder="20000"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              {!!formErrors.nominalError && (
                <View style={s.errorInlineRow}>
                  <AlertCircleIcon width={13} height={13} color="#BA1A1A" />
                  <Text style={s.errorInlineText}>{formErrors.nominalError}</Text>
                </View>
              )}
            </View>

            {/* Kategori Opsional Dropdown Trigger */}
            <View style={s.formGroup}>
              <Text style={s.formLabel}>Kategori opsional</Text>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => setScreen('pick_category')}
                style={[
                  s.categorySelectTrigger,
                  categoryId != null && s.categorySelectTriggerActive,
                  busy && s.inputDisabled,
                ]}
              >
                <View style={s.categorySelectLeft}>
                  {categoryId != null ? (
                    <View style={s.selectedRadioDotWrap}>
                      <View style={s.selectedRadioDot} />
                    </View>
                  ) : null}
                  <Text
                    style={[
                      s.categorySelectTriggerText,
                      categoryId != null && s.categorySelectTriggerTextActive,
                    ]}
                  >
                    {selectedCategoryObj?.nama || 'Tanpa kategori'}
                  </Text>
                </View>
                <ChevronDownIcon
                  width={20}
                  height={20}
                  color={
                    categoryId != null
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
              </Pressable>
              <Text style={s.helperText}>Tanggal otomatis dari server</Text>
            </View>

            {/* Simpan Button */}
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={save}
              style={[s.btnPrimary, busy && s.btnPrimaryBusy]}
            >
              {busy ? (
                <View style={s.busyRow}>
                  <ActivityIndicator size="small" color="#64748B" />
                  <Text style={s.busyText}>Menyimpan...</Text>
                </View>
              ) : (
                <Text style={s.btnPrimaryText}>Simpan</Text>
              )}
            </Pressable>
          </ScrollView>
        )}

        {/* ======================================================== */}
        {/* SCREEN 5: PILIH KATEGORI (Langkah 2 dari 2)             */}
        {/* ======================================================== */}
        {screen === 'pick_category' && (
          <ScrollView
            style={s.flex}
            contentContainerStyle={s.formScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.subHeaderRow}>
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={back}
                style={s.btnSubBack}
              >
                <BackIcon width={14} height={14} color="#0F172A" />
                <Text style={s.btnSubBackText}>Kembali</Text>
              </Pressable>
              <Text style={s.stepLabel}>Langkah 2 dari 2</Text>
            </View>

            <Text style={s.pageHeading}>Pilih kategori</Text>
            <Text style={s.pageSubHeading}>
              Pilih salah satu kategori untuk pencatatan pengeluaran ini
            </Text>

            {/* Category Option List Items */}
            <View style={s.categoryListWrap}>
              {[
                { id: null, nama: 'Tanpa kategori' },
                ...categories,
              ].map((k) => {
                const isSelected = categoryId === k.id;
                return (
                  <Pressable
                    key={String(k.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setCategoryId(k.id)}
                    style={[
                      s.categoryCardItem,
                      isSelected && s.categoryCardItemActive,
                    ]}
                  >
                    <View style={s.categoryCardLeft}>
                      <View
                        style={[
                          s.categoryRadioCircle,
                          isSelected && s.categoryRadioCircleActive,
                        ]}
                      >
                        {isSelected && <View style={s.categoryRadioDot} />}
                      </View>
                      <Text
                        style={[
                          s.categoryCardName,
                          isSelected && s.categoryCardNameActive,
                        ]}
                      >
                        {k.nama}
                      </Text>
                    </View>

                    <View style={s.categoryCardRightIcon}>
                      {getCategoryIcon(
                        k.nama,
                        isSelected ? theme.colors.primary : '#94A3B8',
                        20
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setScreen('create')}
              style={s.btnPrimary}
            >
              <Text style={s.btnPrimaryText}>Pilih Kategori</Text>
            </Pressable>
            <Text style={s.categorySelectedSubtext}>
              {categoryId != null
                ? `Kategori terpilih: ${selectedCategoryObj?.nama}`
                : 'Belum ada kategori yang dipilih'}
            </Text>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* ======================================================== */}
      {/* MODAL 1: KONFIRMASI HAPUS (Figma: Konfirmasi Hapus)      */}
      {/* ======================================================== */}
      <Modal
        visible={deleteConfirmOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteConfirmOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.confirmModalCard}>
            <Text style={s.confirmModalTitle}>Hapus pengeluaran?</Text>
            <Text style={s.confirmModalMessage}>
              {selected
                ? `${selected.judul} — ${rupiah(selected.nominal)} akan dihapus permanen.`
                : 'Pengeluaran ini akan dihapus permanen.'}
            </Text>
            <View style={s.confirmModalButtonsRow}>
              <Pressable
                style={s.btnConfirmBatal}
                onPress={() => setDeleteConfirmOpen(false)}
              >
                <Text style={s.btnConfirmBatalText}>Batal</Text>
              </Pressable>
              <Pressable
                style={s.btnConfirmHapus}
                onPress={() => {
                  setDeleteConfirmOpen(false);
                  remove();
                }}
              >
                <Text style={s.btnConfirmHapusText}>Hapus</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: REKAPITULASI BULAN INI                          */}
      {/* ======================================================== */}
      <Modal
        visible={rekapOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRekapOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeaderRow}>
              <View style={s.modalHeaderLeft}>
                <CalendarIcon width={20} height={20} color={theme.colors.primary} />
                <Text style={s.modalTitle}>Rekapitulasi Bulan Ini</Text>
              </View>
              <Pressable onPress={() => setRekapOpen(false)} hitSlop={8}>
                <ClearIcon width={20} height={20} color="#64748B" />
              </Pressable>
            </View>

            <View style={s.rekapTotalBox}>
              <Text style={s.rekapTotalLabel}>Total Keseluruhan</Text>
              <Text style={s.rekapTotalAmount}>{rupiah(total)}</Text>
              <Text style={s.rekapTotalCount}>
                Dari {items.length} transaksi tercatat di basis data
              </Text>
            </View>

            <Text style={s.rekapSectionTitle}>Rincian per Kategori:</Text>
            <ScrollView style={s.rekapListScroll} showsVerticalScrollIndicator={false}>
              {allCategoryNames.map((catName) => {
                const catItems = items.filter((i) => i.kategori === catName);
                const catTotal = catItems.reduce(
                  (a, b) => a + Number(b.nominal || 0),
                  0
                );
                return (
                  <View key={catName} style={s.rekapRow}>
                    <View style={s.rekapRowLeft}>
                      {getCategoryIcon(catName, theme.colors.primary, 16)}
                      <Text style={s.rekapRowName}>{catName}</Text>
                    </View>
                    <Text style={s.rekapRowAmount}>{rupiah(catTotal)}</Text>
                  </View>
                );
              })}

              {(() => {
                const uncategorizedItems = items.filter((i) => !i.kategori);
                const uncategorizedTotal = uncategorizedItems.reduce(
                  (a, b) => a + Number(b.nominal || 0),
                  0
                );
                return (
                  <View style={s.rekapRow}>
                    <View style={s.rekapRowLeft}>
                      <NoCategoryIcon width={16} height={16} color="#64748B" />
                      <Text style={s.rekapRowName}>Tanpa kategori</Text>
                    </View>
                    <Text style={s.rekapRowAmount}>{rupiah(uncategorizedTotal)}</Text>
                  </View>
                );
              })()}
            </ScrollView>

            <Pressable
              style={s.btnPrimary}
              onPress={() => setRekapOpen(false)}
            >
              <Text style={s.btnPrimaryText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: PENGATURAN KONEKSI BACKEND                      */}
      {/* ======================================================== */}
      <Modal
        visible={settingsOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Pengaturan Koneksi Backend</Text>
            <Text style={s.modalSubtitle}>
              Hubungkan aplikasi mobile ke backend Node.js & basis data MySQL XAMPP
              (db_pengeluaran).
            </Text>

            <Text style={s.formLabel}>URL API Backend:</Text>
            <TextInput
              style={s.inputBase}
              value={serverUrlInput}
              onChangeText={setServerUrlInput}
              placeholder="http://192.168.100.11:3000"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={s.quickPresetsLabel}>Pilihan Preset Cepat:</Text>
            <View style={s.presetsWrap}>
              <Pressable
                style={s.presetBtn}
                onPress={() => setServerUrlInput('http://192.168.100.11:3000')}
              >
                <Text style={s.presetBtnText}>Wi-Fi PC (192.168.100.11:3000)</Text>
              </Pressable>
              <Pressable
                style={s.presetBtn}
                onPress={() => setServerUrlInput('http://localhost:3000')}
              >
                <Text style={s.presetBtnText}>Localhost / Web (localhost:3000)</Text>
              </Pressable>
              <Pressable
                style={s.presetBtn}
                onPress={() => setServerUrlInput('http://10.0.2.2:3000')}
              >
                <Text style={s.presetBtnText}>Android Emulator (10.0.2.2:3000)</Text>
              </Pressable>
            </View>

            {testResult && (
              <View
                style={[
                  s.testResultBox,
                  testResult.success ? s.testSuccess : s.testFailed,
                ]}
              >
                <Text
                  style={[
                    s.testResultText,
                    testResult.success ? s.testSuccessText : s.testFailedText,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            <View style={s.modalButtonsRow}>
              <Pressable
                style={[s.btnModalSecondary, testing && s.disabled]}
                disabled={testing}
                onPress={() => handleTestConnection()}
              >
                {testing ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={s.btnModalSecondaryText}>Tes Koneksi</Text>
                )}
              </Pressable>

              <Pressable
                style={s.btnModalPrimary}
                onPress={() => {
                  api.setBaseUrl(serverUrlInput);
                  setSettingsOpen(false);
                  load();
                }}
              >
                <Text style={s.btnModalPrimaryText}>Simpan & Terapkan</Text>
              </Pressable>
            </View>

            <Pressable
              style={s.btnModalClose}
              onPress={() => setSettingsOpen(false)}
            >
              <Text style={s.btnModalCloseText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
  },
  disabled: {
    opacity: 0.6,
  },

  // App Bar Header (Figma: #2:186)
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFBFB',
  },
  appHeaderTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    color: '#0F172A',
  },
  headerAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Notice Banners
  noticeBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  noticeBannerDeleted: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noticeTextDeleted: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },

  // Center States (Empty & Error)
  centerStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  btnStateAction: {
    width: 240,
    height: 46,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnStateActionText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Sub Header for Detail / Forms (Figma: #2:225 & #2:682)
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  btnSubBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  btnSubBackText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },
  stepLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  trxBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  trxBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: '#475569',
  },
  pageHeading: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    lineHeight: 34,
    color: '#0F172A',
    marginBottom: 6,
  },
  pageSubHeading: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 20,
  },

  // List View Styles
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  listHeaderContainer: {
    marginBottom: 8,
  },

  // Hero Card: Total Pengeluaran Hari Ini (Figma: #2:178)
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 16,
  },
  heroCardLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  heroCardAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    lineHeight: 38,
    color: '#0F172A',
  },
  heroCardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  heroCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroCardSubtext: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },

  // Action Buttons Group: + Tambah Pengeluaran Baru & Muat Ulang (Figma: #2:121)
  actionBtnGroup: {
    gap: 10,
    marginBottom: 20,
  },
  btnPrimary: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnPrimaryBusy: {
    backgroundColor: theme.colors.buttonDisabledBg,
  },
  btnReload: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnReloadText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.primary,
  },

  // Section Header: "Daftar Pengeluaran" & "HARI INI" (Figma: #2:186)
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  sectionTag: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#64748B',
  },

  // Category Filter Pills (Figma: #2:186)
  pillScroll: {
    marginBottom: 16,
  },
  pillScrollContent: {
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: '#475569',
  },
  pillTextActive: {
    fontFamily: theme.fonts.semiBold,
    color: '#FFFFFF',
  },

  // List Item Card (Figma: #2:588)
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  itemBadge: {
    backgroundColor: theme.colors.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  itemBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: theme.colors.badgeText,
  },
  itemAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: '#0F172A',
    marginBottom: 8,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.primary,
  },

  // List Footer: Summary Card & Rekapitulasi Button (Figma: #2:653)
  listFooterWrap: {
    marginTop: 8,
    gap: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.summaryBg,
    borderRadius: 12,
  },
  summaryCardLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  summaryCardCount: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
  },
  summaryCardAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 19,
    color: '#0F172A',
  },
  btnRekap: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnRekapText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },

  // Detail View Styles (Figma: Detail Pengeluaran #2:678)
  detailScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 14,
  },
  detailCardTag: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.6,
  },
  detailCardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: '#0F172A',
    marginTop: 6,
  },
  detailCardAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    color: theme.colors.primary,
    marginTop: 4,
  },
  detailCardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRowLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  detailRowValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },
  detailCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailCategoryBadgeText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 12,
    color: '#0F172A',
  },
  detailNoteSection: {
    marginTop: 4,
    gap: 6,
  },
  detailNoteBox: {
    backgroundColor: '#F3F5FA',
    borderRadius: 8,
    padding: 12,
  },
  detailNoteText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  detailNoteItalic: {
    fontStyle: 'italic',
    color: '#64748B',
  },
  detailHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  detailHelperText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  actionMarginBottom: {
    marginBottom: 12,
  },
  btnOutlineDelete: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOutlineDeleteText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#BA1A1A',
  },

  // 404 Not Found in Detail Screen (Figma: Data Tidak Ditemukan)
  centerNotFoundContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  notFoundIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
  },
  notFoundSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  fullWidth: {
    width: '100%',
  },
  btnOutlinePlain: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  btnOutlinePlainText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  notFoundTipBox: {
    backgroundColor: '#F1F4FF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  notFoundTipText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    flex: 1,
  },

  // Form Styles (Figma: #2:203 & #2:496)
  formScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  formLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 6,
  },
  formLabelHint: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  inputBase: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: '#0F172A',
  },
  inputWithClearWrap: {
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithClearText: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: '#0F172A',
  },
  nominalInputWrap: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nominalPrefixBox: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  nominalPrefixText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#0F172A',
  },
  nominalTextInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#BA1A1A',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  errorInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorInlineText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#BA1A1A',
  },
  terbilangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  terbilangText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.primary,
  },
  categorySelectTrigger: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectTriggerActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F2F9F7',
  },
  categorySelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedRadioDotWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  categorySelectTriggerText: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: '#0F172A',
  },
  categorySelectTriggerTextActive: {
    fontFamily: theme.fonts.semiBold,
    color: '#0F172A',
  },
  helperText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },

  // Locked Card (Figma: #2:496)
  lockedCard: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 10,
  },
  lockedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lockedTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedTitleText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  lockedBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  lockedBadgeText: {
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: '#64748B',
  },
  lockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockedLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  lockedValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: '#0F172A',
  },
  lockedCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  lockedCategoryText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: '#0F172A',
  },
  lockedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  lockedFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  lockedFooterText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    flex: 1,
  },

  // Buttons in Edit Screen
  btnIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnDangerOutline: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnDangerOutlineText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#BA1A1A',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busyText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: '#64748B',
  },

  // Category Selection Screen Items (Figma: Pilih Kategori)
  categoryListWrap: {
    gap: 10,
    marginBottom: 24,
  },
  categoryCardItem: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCardItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F2F9F7',
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRadioCircleActive: {
    borderColor: theme.colors.primary,
  },
  categoryRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  categoryCardName: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: '#0F172A',
  },
  categoryCardNameActive: {
    fontFamily: theme.fonts.semiBold,
    color: '#0F172A',
  },
  categoryCardRightIcon: {
    width: 24,
    alignItems: 'center',
  },
  categorySelectedSubtext: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },

  // Custom Delete Confirm Modal (Figma: Konfirmasi Hapus)
  confirmModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  confirmModalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
  },
  confirmModalMessage: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 20,
  },
  confirmModalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnConfirmBatal: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmBatalText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },
  btnConfirmHapus: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#BA1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnConfirmHapusText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Rekapitulasi Modal Styles
  rekapTotalBox: {
    backgroundColor: '#F1F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rekapTotalLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: '#64748B',
  },
  rekapTotalAmount: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: '#0F172A',
    marginVertical: 4,
  },
  rekapTotalCount: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#64748B',
  },
  rekapSectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  rekapListScroll: {
    maxHeight: 200,
    marginBottom: 16,
  },
  rekapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rekapRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rekapRowName: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: '#0F172A',
  },
  rekapRowAmount: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.primary,
  },

  // Settings Modal Styles
  quickPresetsLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  presetsWrap: {
    gap: 6,
    marginBottom: 14,
  },
  presetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  presetBtnText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: '#0F172A',
  },
  testResultBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  testSuccess: {
    backgroundColor: '#D1FAE5',
  },
  testFailed: {
    backgroundColor: '#FEE2E2',
  },
  testResultText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  testSuccessText: {
    color: '#065F46',
  },
  testFailedText: {
    color: '#991B1B',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  btnModalSecondary: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnModalSecondaryText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.primary,
  },
  btnModalPrimary: {
    flex: 1.5,
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnModalPrimaryText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnModalClose: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnModalCloseText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: '#64748B',
  },
});