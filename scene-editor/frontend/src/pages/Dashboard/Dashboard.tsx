import React from "react";

import { View } from '../../types/views';

import "./Dashboard.scss";

import TopBar from "../../components/TopBar";
import SideMenu from "../../components/SideMenu";
import ProjectOverview from "../../components/ProjectOverview";
import UsersView from "../../components/UsersView";
import Analytics from "../../components/Analytics";

interface DashboardProps {
    view: View
}

const Dashboard: React.FC<DashboardProps> = ({view}:DashboardProps) => {
    const viewToComponent = (view:View) => {
      switch (view) {
        case View.Project:
          return <ProjectOverview />
        case View.Users:
          return <UsersView />
        case View.Analytics:
          return <Analytics />
        default:
          return <ProjectOverview />
      }
    }

    return (
      <div>
        <TopBar />
        <div className="dashboard-page">
          <SideMenu activeView={view}/>
          { viewToComponent(view) }
        </div>
      </div>
    );
};

export default Dashboard;
