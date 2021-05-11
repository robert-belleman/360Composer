from app.models.database import db
from app.models.timeline import Timeline as TimelineModel, TimelineScenario as TimelineScenarioModel, CustomerTimeline as CustomerTimelineModel
from app.models.scenario import Scenario as ScenarioModel, ScenarioScene as ScenarioSceneModel, ScenarioSceneLink as ScenarioSceneLinkModel

def validate(scenario_id):
    scenario = ScenarioModel.query.filter_by(id=scenario_id).first()

    if scenario is None:
        return {'valid': False, 'message': "Scenario not found", 'invalid_nodes': []}

    if scenario.start_scene is None:
        return {'valid': False, 'message': "No start node", 'invalid_nodes': []}

    start_scene = ScenarioSceneModel.query.filter_by(id=scenario.start_scene, scenario_id=scenario.id).first()
    all_scenes = ScenarioSceneModel.query.filter_by(scenario_id=scenario.id).all()

    reachable_nodes = [start_scene.id]
    nodes_to_traverse = [start_scene.id]

    while len(nodes_to_traverse) != 0:
        # WARNING: mutates the original list
        current_node = nodes_to_traverse.pop(0)

        links = ScenarioSceneLinkModel.query.filter_by(source_id=current_node).all()
        for link in links:
            if link.target_id is not None:
                target = ScenarioSceneModel.query.filter_by(id=link.target_id).first()

                # check if we already have traversed this node in case of a loop
                if target.id not in reachable_nodes:
                    reachable_nodes.append(target.id)
                    nodes_to_traverse.append(target.id)

    # Get the difference between all the scenes and the reachable scenes
    diff = list(set([scene.id for scene in all_scenes]) - set(reachable_nodes))
    
    # There are some nodes that are not reachable
    if len(diff) != 0:
        return {'valid': False, 'message': "Unreachable Nodes", 'invalid_nodes': diff}
    
    return {'valid': True, 'message': "", 'invalid_nodes': []}

