/**
 * AssetsContext.tsx
 *
 * Description:
 * This file defines a React context and provider for managing assets related
 * to a project. The context, AssetsContext, encapsulates the state of assets,
 * including their details such as ID, name, path, thumbnail, duration, and
 * other relevant information. The context provides functions like createClip
 * and fetchAssets for interacting with the assets.
 *
 * Contents:
 * - Asset: Interface defining the structure of assets.
 * - AssetsContextProps: Interface defining the shape of the context values.
 * - AssetsContext: React context for managing assets and related functions.
 * - AssetsProvider: Context provider component for making the assets state and functions accessible.
 *
 */

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  path: string;
  thumbnail_path: string;
  duration: number;
  file_size: number;
  asset_type: string;
  view_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  scene: any;
}

interface AssetsContextProps {
  assets: Asset[];
  loading: boolean;
  fetchAssets: () => Promise<void>;
  sortOption: string;
  orderOption: string;
  changeSorting: (newOption: string) => void;
  changeOrdering: (newOption: string) => void;
  sortAssets: (assets: Asset[]) => Asset[];
  filterOptions: string[];
  toggleFilter: (filter: string) => void;
  filterAssets: (assets: Asset[]) => Asset[];
  filterSetting: string;
  changeFilterSetting: (newSetting: string) => void;
}

const AssetsContext = createContext<AssetsContextProps | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

const AssetsProvider: FC<AssetsProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("name");
  const [orderOption, setOrderOption] = useState("asc");
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [filterSetting, setFilterSetting] = useState("any");
  const { projectID } = useParams();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      // Fetch assets for the current project
      const res = await axios.get(`/api/project/${projectID}/assets`, {});
      setAssets(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeSorting = (newOption: string) => {
    setSortOption(newOption);
  };

  const changeOrdering = (newOption: string) => {
    setOrderOption(newOption);
  };

  /**
   * Sort assets based on `sortOption`. The sorting is ordered according to
   * `orderOption`.
   * @param assets assets to sort
   * @returns sorted assets.
   */
  const sortAssets = (assets: Asset[]) => {
    return [...assets].sort((a, b) => {
      let result = 0;

      if (sortOption === "name") {
        result = a.name.localeCompare(b.name);
      } else if (sortOption === "date") {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        result = dateA - dateB;
      }

      return orderOption === "desc" ? -result : result;
    });
  };

  const filters = {
    name: (asset: Asset, filter: string) =>
      asset.name.toLowerCase() === filter.toLowerCase(),
    "duration<": (asset: Asset, filter: string) =>
      asset.duration < parseInt(filter, 10),
    "duration>": (asset: Asset, filter: string) =>
      asset.duration > parseInt(filter, 10),
    view_type: (asset: Asset, filter: string) =>
      asset.view_type.toLowerCase() === filter.toLowerCase(),
    asset_type: (asset: Asset, filter: string) =>
      asset.asset_type.toLowerCase() === filter.toLowerCase(),
    // Add more filters as needed
  };

  /**
   * Filter assets based on `filterOptions`. Assets will be in the resulting
   * array if they satisfy any or all filters depending on `filterSetting`.
   * @param assets assets to filter
   * @returns filtered assets.
   */
  const filterAssets = (assets: Asset[]) => {
    if (filterOptions.length === 0) {
      return assets; // No filters, return all assets
    }

    return assets.filter((asset) => {
      if (filterSetting === "any") {
        return filterOptions.some((filter: string) => {
          const [field, filterValue] = filter.split(":");
          return (
            field in filters && (filters as any)[field](asset, filterValue)
          );
        });
      }

      if (filterSetting === "all") {
        return filterOptions.every((filter: string) => {
          const [field, filterValue] = filter.split(":");
          return (
            field in filters && (filters as any)[field](asset, filterValue)
          );
        });
      }

      return true;
    });
  };

  /**
   * Add or remove a filter from the filter options.
   * A filter is of the form field:filter where field is a n attribute of
   * an asset (i.e. asset_type) and filter is the string to compare with
   * (i.e. "video").
   * @param filter
   */
  const toggleFilter = (filter: string) => {
    const [field, filterValue] = filter
      .toLowerCase()
      .split(":")
      .map((part) => part.trim());
    if (field in filters) {
      if (filterOptions.includes(filter)) {
        // Filter already exists, remove it.
        setFilterOptions(filterOptions.filter((f) => f !== filter));
      } else {
        // Filter doesn't exist, add it.
        setFilterOptions([...filterOptions, filter]);
      }
    }
  };

  /**
   * Change the filter setting to the new filter setting.
   * @param newSetting new filter setting.
   */
  const changeFilterSetting = (newSetting: string) => {
    setFilterSetting(newSetting);
  };

  useEffect(() => {
    fetchAssets();
  }, [projectID]);

  const contextValue: AssetsContextProps = {
    assets,
    loading,
    fetchAssets,
    sortOption,
    orderOption,
    changeSorting,
    changeOrdering,
    sortAssets,
    filterOptions,
    toggleFilter,
    filterAssets,
    filterSetting,
    changeFilterSetting,
  };

  return (
    <AssetsContext.Provider value={contextValue}>
      {children}
    </AssetsContext.Provider>
  );
};

const useAssetsContext = (): AssetsContextProps => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error("useAssetsContext must be used within a AssetsProvider");
  }
  return context;
};

export { AssetsContext, AssetsProvider, useAssetsContext };
