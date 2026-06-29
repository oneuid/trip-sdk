import { injectStyles } from './styles';

interface WidgetLabels {
  loading: string;
  error: string;
  oneWay: string;
  roundTrip: string;
  route: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  search: string;
}

interface WidgetConfig {
  organizationId?: string;
  themeColor?: string;
  baseURL?: string;
  marketplaceURL?: string;
  targetElementId?: string;
  locale?: string;
  labels?: Partial<WidgetLabels>;
  onSearch?: (data: SearchData) => void;
}

interface SearchData {
  tripType: 'oneway' | 'roundtrip';
  origin: string;
  destination: string;
  outboundDate: string;
  returnDate?: string;
  experienceSlug: string;
}

declare global {
  interface Window {
    TripExpressWidgetConfigs?: WidgetConfig;
  }
}

const DEFAULT_LABELS: WidgetLabels = {
  loading: 'Loading booking widget...',
  error: 'Error',
  oneWay: 'One-way',
  roundTrip: 'Round-trip',
  route: 'Route',
  origin: 'Origin',
  destination: 'Destination',
  departureDate: 'Departure Date',
  returnDate: 'Return Date',
  search: 'Search Tickets',
};

class TripExpressWidget {
  private container: HTMLElement | null = null;
  private config: Required<WidgetConfig> = {
    organizationId: '',
    themeColor: '#FFB800',
    baseURL: 'https://api.trip.express',
    marketplaceURL: 'https://trip.express',
    targetElementId: 'trip-express-widget',
    locale: 'en',
    labels: {},
    onSearch: (data) => this.defaultRedirect(data),
  };

  private labels: WidgetLabels = { ...DEFAULT_LABELS };
  private availableRoutes: any[] = [];
  private currentExperience: any = null;
  private selectedTripType: 'oneway' | 'roundtrip' = 'oneway';
  private currentOrigin: string = '';
  private currentDestination: string = '';

  constructor() {
    this.init();
  }

  private async init() {
    // 1. Merge configurations
    if (window.TripExpressWidgetConfigs) {
      this.config = {
        ...this.config,
        ...window.TripExpressWidgetConfigs,
      };
    }

    // 2. Find target element
    this.container = document.getElementById(this.config.targetElementId);
    if (!this.container) {
      console.warn(`TripExpressWidget: target element with ID "${this.config.targetElementId}" not found.`);
      return;
    }

    // 3. Inject styles
    injectStyles(this.config.themeColor);

    // 4. Load translations dynamically
    await this.loadTranslations();

    // Render loading state
    this.renderLoading();

    try {
      // 5. Resolve Organization and fetch Experiences
      let orgId = this.config.organizationId;
      if (!orgId) {
        // Resolve by domain
        const host = window.location.host;
        const resolveUrl = `${this.config.baseURL}/crm/organizations/resolve-domain/?domain=${host}`;
        const res = await fetch(resolveUrl);
        if (res.ok) {
          const orgData = await res.json();
          orgId = orgData.id;
          if (orgData.theme_config?.primary_color) {
            this.config.themeColor = orgData.theme_config.primary_color;
            injectStyles(this.config.themeColor);
          }
        }
      }

      if (!orgId) {
        throw new Error('Could not resolve Organization ID.');
      }

      // Fetch experiences
      const expUrl = `${this.config.baseURL}/offerings/experiences/?tenant_id=${orgId}&type=transport`;
      const expRes = await fetch(expUrl);
      if (!expRes.ok) throw new Error('Failed to fetch experiences.');

      const expData = await expRes.json();
      const experiences = expData.results || [];
      if (experiences.length === 0) {
        this.renderError('No active transport experiences found for this provider.');
        return;
      }

      // Pick first active transport experience
      this.currentExperience = experiences[0];

      // Extract available routes
      this.availableRoutes = this.currentExperience.routes || [];
      if (this.availableRoutes.length === 0) {
        this.renderError('No routes configured for this transport offering.');
        return;
      }

      // Set default values
      const firstRoute = this.availableRoutes[0];
      const orgName = firstRoute.origin?.name || firstRoute.origin?.title || firstRoute.name?.split(/[-–—↔\.]+/)[0]?.trim();
      const destName = firstRoute.destination?.name || firstRoute.destination?.title || firstRoute.name?.split(/[-–—↔\.]+/)[1]?.trim();
      this.currentOrigin = orgName;
      this.currentDestination = destName;

      // 6. Render widget
      this.render();

    } catch (err: any) {
      console.error('TripExpressWidget initialization failed:', err);
      this.renderError(err.message || 'Error loading booking widget.');
    }
  }

  private async loadTranslations() {
    this.labels = { ...DEFAULT_LABELS };

    if (this.config.locale !== 'en') {
      try {
        const transUrl = `${this.config.marketplaceURL}/locales/widget/${this.config.locale}.json`;
        const res = await fetch(transUrl);
        if (res.ok) {
          const data = await res.json();
          this.labels = {
            ...this.labels,
            ...data,
          };
        }
      } catch (err) {
        console.warn('Failed to load dynamic widget translations:', err);
      }
    }

    // Apply manual label overrides if provided
    if (this.config.labels) {
      this.labels = {
        ...this.labels,
        ...this.config.labels,
      };
    }
  }

  private renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="tx-widget-container" style="display:flex; justify-content:center; align-items:center; min-height:100px;">
        <span style="color:#71717a; font-size:14px; font-weight:500;">${this.labels.loading}</span>
      </div>
    `;
  }

  private renderError(message: string) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="tx-widget-container" style="border-color:#f87171;">
        <span style="color:#ef4444; font-size:13px; font-weight:500;">${this.labels.error}: ${message}</span>
      </div>
    `;
  }

  private render() {
    if (!this.container) return;

    // Get unique origins
    const originsSet = new Set<string>();
    this.availableRoutes.forEach(r => {
      const name = r.origin?.name || r.origin?.title || r.name?.split(/[-–—↔\.]+/)[0]?.trim();
      if (name) originsSet.add(name);
    });
    const origins = Array.from(originsSet);

    // Get destinations based on selected origin
    const destinationsSet = new Set<string>();
    this.availableRoutes.forEach(r => {
      const orgName = r.origin?.name || r.origin?.title || r.name?.split(/[-–—↔\.]+/)[0]?.trim();
      if (orgName === this.currentOrigin) {
        const destName = r.destination?.name || r.destination?.title || r.name?.split(/[-–—↔\.]+/)[1]?.trim();
        if (destName) destinationsSet.add(destName);
      }
    });
    const destinations = Array.from(destinationsSet);

    // Ensure currently selected destination is valid for current origin
    if (destinations.indexOf(this.currentDestination) === -1 && destinations.length > 0) {
      this.currentDestination = destinations[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const html = `
      <div class="tx-widget-container">
        <!-- 1. Tabs -->
        <div class="tx-tabs-list">
          <button type="button" class="tx-tab-trigger ${this.selectedTripType === 'oneway' ? 'active' : ''}" id="tx-tab-oneway">${this.labels.oneWay}</button>
          <button type="button" class="tx-tab-trigger ${this.selectedTripType === 'roundtrip' ? 'active' : ''}" id="tx-tab-roundtrip">${this.labels.roundTrip}</button>
        </div>

        <!-- 2. Form Grid -->
        <div class="tx-grid">
          <!-- Route Box -->
          <div class="tx-input-group">
            <span class="tx-label">${this.labels.route}</span>
            <div class="tx-route-box">
              <div class="tx-route-col">
                <span style="font-size:10px; font-weight:600; text-transform:uppercase; color:#a1a1aa;">${this.labels.origin}</span>
                <div class="tx-field-wrapper">
                  <select class="tx-select" id="tx-select-origin" style="padding:0; border:none; background:transparent; font-size:14px; font-weight:600; height:auto;">
                    ${origins.map(o => `<option value="${o}" ${o === this.currentOrigin ? 'selected' : ''}>${o}</option>`).join('')}
                  </select>
                </div>
              </div>
              
              <button type="button" class="tx-swap-btn" id="tx-btn-swap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-repeat" style="stroke:#71717a;"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
              </button>
              
              <div class="tx-route-col" style="align-items:flex-end; text-align:right;">
                <span style="font-size:10px; font-weight:600; text-transform:uppercase; color:#a1a1aa;">${this.labels.destination}</span>
                <div class="tx-field-wrapper">
                  <select class="tx-select" id="tx-select-destination" style="padding:0; border:none; background:transparent; font-size:14px; font-weight:600; height:auto; text-align-last:right;">
                    ${destinations.map(d => `<option value="${d}" ${d === this.currentDestination ? 'selected' : ''}>${d}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Picker Box -->
          <div class="tx-input-group">
            <span class="tx-label">${this.labels.departureDate}</span>
            <input type="date" class="tx-input" id="tx-input-outbound-date" min="${todayStr}" value="${todayStr}">
          </div>

          <div class="tx-input-group" id="tx-return-date-container" style="display:${this.selectedTripType === 'roundtrip' ? 'flex' : 'none'};">
            <span class="tx-label">${this.labels.returnDate}</span>
            <input type="date" class="tx-input" id="tx-input-return-date" min="${todayStr}" value="${tomorrowStr}">
          </div>
        </div>

        <!-- 3. Search Button -->
        <button type="button" class="tx-search-btn" id="tx-btn-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>${this.labels.search}</span>
        </button>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  private bindEvents() {
    const tabOneway = document.getElementById('tx-tab-oneway');
    const tabRoundtrip = document.getElementById('tx-tab-roundtrip');
    const selectOrigin = document.getElementById('tx-select-origin') as HTMLSelectElement;
    const selectDestination = document.getElementById('tx-select-destination') as HTMLSelectElement;
    const btnSwap = document.getElementById('tx-btn-swap');
    const btnSearch = document.getElementById('tx-btn-search');
    const returnDateContainer = document.getElementById('tx-return-date-container');

    tabOneway?.addEventListener('click', () => {
      this.selectedTripType = 'oneway';
      tabOneway.classList.add('active');
      tabRoundtrip?.classList.remove('active');
      if (returnDateContainer) returnDateContainer.style.display = 'none';
    });

    tabRoundtrip?.addEventListener('click', () => {
      this.selectedTripType = 'roundtrip';
      tabRoundtrip.classList.add('active');
      tabOneway?.classList.remove('active');
      if (returnDateContainer) returnDateContainer.style.display = 'flex';
    });

    selectOrigin?.addEventListener('change', (e) => {
      this.currentOrigin = (e.target as HTMLSelectElement).value;
      this.render();
    });

    selectDestination?.addEventListener('change', (e) => {
      this.currentDestination = (e.target as HTMLSelectElement).value;
    });

    btnSwap?.addEventListener('click', () => {
      const temp = this.currentOrigin;
      this.currentOrigin = this.currentDestination;
      this.currentDestination = temp;
      this.render();
    });

    btnSearch?.addEventListener('click', () => {
      const outboundInput = document.getElementById('tx-input-outbound-date') as HTMLInputElement;
      const returnInput = document.getElementById('tx-input-return-date') as HTMLInputElement;
      
      const searchData: SearchData = {
        tripType: this.selectedTripType,
        origin: this.currentOrigin,
        destination: this.currentDestination,
        outboundDate: outboundInput ? outboundInput.value : '',
        experienceSlug: this.currentExperience?.slug || '',
      };

      if (this.selectedTripType === 'roundtrip' && returnInput) {
        searchData.returnDate = returnInput.value;
      }

      this.config.onSearch(searchData);
    });
  }

  private defaultRedirect(data: SearchData) {
    // Look up the exact matching route ID to direct to booking widget properly
    const matchingRoute = this.availableRoutes.find(r => {
      const orgName = r.origin?.name || r.origin?.title || r.name?.split(/[-–—↔\.]+/)[0]?.trim();
      const destName = r.destination?.name || r.destination?.title || r.name?.split(/[-–—↔\.]+/)[1]?.trim();
      return orgName === data.origin && destName === data.destination;
    });

    const routeIdStr = matchingRoute ? `&route_id=${matchingRoute.id}` : '';

    const url = `${this.config.marketplaceURL}/${this.config.locale}/experiences/${data.experienceSlug}?tripType=${data.tripType}&origin=${encodeURIComponent(data.origin)}&destination=${encodeURIComponent(data.destination)}&outboundDate=${data.outboundDate}${data.returnDate ? `&returnDate=${data.returnDate}` : ''}${routeIdStr}`;
    window.open(url, '_blank');
  }
}

// Auto-initialize when the DOM is ready
if (document.readyState === 'complete') {
  new TripExpressWidget();
} else {
  window.addEventListener('DOMContentLoaded', () => new TripExpressWidget());
}
