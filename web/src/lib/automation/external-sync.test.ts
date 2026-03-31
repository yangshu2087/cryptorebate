import { beforeEach, describe, expect, it, vi } from 'vitest';

const readExternalSyncStateFromDisk = vi.fn();
const writeExternalSyncStateToDisk = vi.fn();
const writeGeneratedGscSignalsToDisk = vi.fn();
const writeGeneratedPartnerConversionsToDisk = vi.fn();
const writeGeneratedPartnerCommissionsToDisk = vi.fn();
const regenerateAutomationState = vi.fn();
const fetchSearchConsoleSignals = vi.fn();
const fetchSearchConsolePageObservations = vi.fn();
const submitSearchConsoleSitemaps = vi.fn();
const getSearchConsoleConfig = vi.fn();
const getPartnerSyncConfigs = vi.fn();
const syncPartnerSource = vi.fn();
const getDiscoveryAssetUrls = vi.fn();

vi.mock('./persistence', () => ({
  readExternalSyncStateFromDisk,
  writeExternalSyncStateToDisk,
  writeGeneratedGscSignalsToDisk,
  writeGeneratedPartnerConversionsToDisk,
  writeGeneratedPartnerCommissionsToDisk,
  regenerateAutomationState,
}));

vi.mock('./external-search-console', () => ({
  fetchSearchConsoleSignals,
  fetchSearchConsolePageObservations,
  submitSearchConsoleSitemaps,
}));

vi.mock('./external-config', () => ({
  getSearchConsoleConfig,
  getPartnerSyncConfigs,
}));

vi.mock('./external-partner-sync', () => ({
  syncPartnerSource,
}));

vi.mock('./discovery', () => ({
  getDiscoveryAssetUrls,
}));

describe('runExternalSync', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    getSearchConsoleConfig.mockReturnValue({
      enabled: true,
      property: 'https://cryptorebate.app/',
      authMode: 'service-account',
      submitSitemaps: true,
      startDaysAgo: 28,
      rowLimit: 1000,
    });
    getPartnerSyncConfigs.mockReturnValue([]);
    readExternalSyncStateFromDisk.mockResolvedValue({
      generatedAt: '2026-03-26T14:57:44.377Z',
      gsc: {
        enabled: true,
        configured: true,
        status: 'success',
        property: 'https://cryptorebate.app/',
        authMode: 'service-account',
        rowsFetched: 0,
        signalsWritten: 0,
        sitemapSubmitStatus: 'failed',
        lastSitemapSubmitAt: '2026-03-26T14:57:44.377Z',
        sitemapSubmitError: 'Could not process sitemap /sitemap.xml',
      },
      partners: [],
    });
    fetchSearchConsoleSignals.mockResolvedValue({
      signals: [],
      report: {
        enabled: true,
        configured: true,
        status: 'success',
        property: 'https://cryptorebate.app/',
        authMode: 'service-account',
        rowsFetched: 0,
        signalsWritten: 0,
        lastSyncAt: '2026-03-29T12:27:50.377Z',
      },
    });
    submitSearchConsoleSitemaps.mockResolvedValue({
      enabled: true,
      configured: true,
      status: 'success',
      property: 'https://cryptorebate.app/',
      authMode: 'service-account',
      submitted: [
        'https://cryptorebate.app/sitemap.xml',
        'https://cryptorebate.app/brand-sitemap.xml',
      ],
      lastSubmittedAt: '2026-03-29T12:27:52.046Z',
    });
    fetchSearchConsolePageObservations.mockResolvedValue([]);
    getDiscoveryAssetUrls.mockReturnValue([
      'https://cryptorebate.app/sitemap.xml',
      'https://cryptorebate.app/brand-sitemap.xml',
    ]);
    regenerateAutomationState.mockResolvedValue({ version: 1 });
  });

  it('clears stale sitemap submit errors after a successful resubmission', async () => {
    const { runExternalSync } = await import('./external-sync');

    const result = await runExternalSync('gsc');

    expect(result.externalState.gsc.sitemapSubmitStatus).toBe('success');
    expect(result.externalState.gsc.sitemapSubmitError).toBeUndefined();
    expect(writeExternalSyncStateToDisk).toHaveBeenCalledWith(
      expect.objectContaining({
        gsc: expect.objectContaining({
          sitemapSubmitStatus: 'success',
          sitemapSubmitError: undefined,
        }),
      })
    );
  });

  it('tracks first-seen focus page rows in external state and sync result', async () => {
    fetchSearchConsolePageObservations.mockResolvedValue([
      {
        url: 'https://cryptorebate.app/en/exchanges/binance/referral-code',
        impressions: 5,
        clicks: 0,
        ctr: 0,
        position: 7.2,
      },
    ]);

    const { runExternalSync } = await import('./external-sync');
    const result = await runExternalSync('gsc');

    expect(result.gscFocusPageRowFirstSeen).toHaveLength(1);
    expect(result.gscFocusPageImpressionFirstSeen).toHaveLength(1);
    expect(result.gscFocusPageClickFirstSeen).toHaveLength(0);
    expect(result.gscFocusPageMilestoneEvents).toHaveLength(1);
    expect(result.gscFocusPageMilestoneEvents?.[0]).toMatchObject({
      milestone: 'impression',
      entry: expect.objectContaining({
        exchangeSlug: 'binance',
        pageType: 'referral-code',
        locale: 'en',
      }),
    });
    expect(result.gscFocusPageRowFirstSeen?.[0]).toMatchObject({
      exchangeSlug: 'binance',
      pageType: 'referral-code',
      locale: 'en',
    });
    expect(result.externalState.gsc.focusPageRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'focus-page-row:en:binance:referral-code',
          seenInPageRows: true,
          latestImpressions: 5,
        }),
      ])
    );
  });
});
