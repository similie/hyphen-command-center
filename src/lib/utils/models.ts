import {
  ModelActions,
  type BaseModel,
  type BaseUIDModel,
  type ModelChangeType,
} from "$lib/types";
import { createEventDispatcher } from "svelte";

export class ModelActionsManager<t extends BaseModel | BaseUIDModel> {
  getDocumentIndex(model: t, models: t[]) {
    for (let i = 0; i < models.length; i++) {
      const currentModel = models[i];
      if (
        "id" in currentModel &&
        "id" in model &&
        currentModel.id === model.id
      ) {
        return i;
      }

      if (
        "uid" in currentModel &&
        "uid" in model &&
        currentModel.uid === model.uid
      ) {
        return i;
      }
    }
    return -1;
  }

  removeModel(model: t, models: t[]) {
    const localModels = [...models];
    const index = this.getDocumentIndex(model, models);
    if (index === -1) {
      console.error("Could not find model in the model list");
      return models;
    }
    localModels.splice(index, 1);
    return localModels;
  }

  updateModel(model: t, models: t[]) {
    const localModels = [...models];
    const index = this.getDocumentIndex(model, models);
    if (index === -1) {
      console.error("Could not find model in the model list");
      return models;
    }
    localModels[index] = model;
    return localModels;
  }

  changeModel(change: ModelChangeType<t>, models: t[]): t[] {
    switch (change.action) {
      case ModelActions.CREATE:
        return [...models, change.model];
      case ModelActions.ATTACH:
        // reconsidering the attach logic
        return [...models, change.model];
      case ModelActions.DELETE:
        return this.removeModel(change.model, models);
      case ModelActions.DETACH:
        return this.removeModel(change.model, models);
      case ModelActions.CLEAR:
        return [];
      default:
        return this.updateModel(change.model, models);
    }
  }
}

export class ModelActionsDispatcher<t extends BaseModel | BaseUIDModel> {
  private readonly eventDispatcher = createEventDispatcher<{
    modelChange: ModelChangeType<t>;
  }>();
  changeModel(action: ModelActions, model: t) {
    this.eventDispatcher("modelChange", { action, model });
  }
  forwardModel(action: ModelChangeType<t>) {
    this.eventDispatcher("modelChange", action);
  }
}
