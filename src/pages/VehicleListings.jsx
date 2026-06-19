import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaCarSide, FaSlidersH } from 'react-icons/fa'
import SearchBar from '../components/SearchBar'
import VehicleCard from '../components/VehicleCard'
import EmptyState from '../components/EmptyState'
import Seo from '../components/Seo'
import { getVehicles } from '../services/vehicleService'

const SORTS = {
  soonest: 'Departing soonest',
  priceLow: 'Price: low to high',
  priceHigh: 'Price: high to low',
  rating: 'Top rated',
}

export default function VehicleListings() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    fromCity: searchParams.get('fromCity') || '',
    toCity: searchParams.get('toCity') || '',
    date: searchParams.get('date') || '',
    vehicleType: searchParams.get('vehicleType') || '',
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('soonest')

  // Load whenever filters change.
  useEffect(() => {
    let active = true
    setLoading(true)
    getVehicles(filters).then((data) => {
      if (active) {
        setVehicles(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [filters])

  const applySearch = (values) => {
    setFilters(values)
    const params = new URLSearchParams()
    Object.entries(values).forEach(([k, v]) => v && params.set(k, v))
    setSearchParams(params)
  }

  const clearFilters = () => applySearch({ fromCity: '', toCity: '', date: '', vehicleType: '' })

  const sorted = useMemo(() => {
    const list = [...vehicles]
    switch (sort) {
      case 'priceLow':
        return list.sort((a, b) => a.pricePerSeat - b.pricePerSeat)
      case 'priceHigh':
        return list.sort((a, b) => b.pricePerSeat - a.pricePerSeat)
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating)
      default:
        return list
    }
  }, [vehicles, sort])

  const hasFilters = Object.values(filters).some(Boolean)

  const seoTitle =
    filters.fromCity && filters.toCity
      ? `${filters.fromCity} to ${filters.toCity} — Available Vehicles`
      : 'Vehicles to Gilgit-Baltistan — Hunza, Gilgit, Skardu, Ghizer'

  return (
    <div className="listings">
      <Seo
        title={seoTitle}
        description="Search seats and whole vehicles to Gilgit-Baltistan by route and date — Hunza, Gilgit, Skardu and Ghizer — from across GB and from Islamabad, Rawalpindi and Lahore."
        path="/vehicles"
      />
      <div className="listings-hero">
        <div className="container">
          <h1>Find your ride to the north</h1>
          <p>Search seats and vehicles to Gilgit-Baltistan and from major Pakistani cities.</p>
          <SearchBar values={filters} onChange={setFilters} onSubmit={applySearch} variant="inline" />
        </div>
      </div>

      <div className="container listings-body">
        <div className="listings-toolbar">
          <div className="results-count">
            <FaSlidersH />
            {loading ? 'Searching…' : `${sorted.length} ${sorted.length === 1 ? 'vehicle' : 'vehicles'} found`}
            {hasFilters && !loading && (
              <button className="link-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
          <label className="sort-select">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="card-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="vehicle-card skeleton-card" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={FaCarSide}
            title="No vehicles match your search"
            message="Try widening your route or clearing the date filter."
            action={
              hasFilters && (
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <div className="card-grid">
            {sorted.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
