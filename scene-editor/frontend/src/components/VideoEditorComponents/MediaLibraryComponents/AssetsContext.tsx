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
}

const AssetsContext = createContext<AssetsContextProps | undefined>(undefined);

interface AssetsProviderProps {
  children: ReactNode;
}

const AssetsProvider: FC<AssetsProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchAssets();
  }, [projectID]);

  const contextValue: AssetsContextProps = {
    assets,
    loading,
    fetchAssets,
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
    throw new Error("useAssetsContext must be used within a ClipsProvider");
  }
  return context;
};

export { AssetsContext, AssetsProvider, useAssetsContext };
