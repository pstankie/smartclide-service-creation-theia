import { ContainerModule } from 'inversify';
import { SmartclideServiceCreationTheiaWidget } from './smartclide-service-creation-theia-widget';
import { SmartclideServiceCreationTheiaContribution } from './smartclide-service-creation-theia-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, SmartclideServiceCreationTheiaContribution);
    bind(FrontendApplicationContribution).toService(SmartclideServiceCreationTheiaContribution);
    bind(SmartclideServiceCreationTheiaWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: SmartclideServiceCreationTheiaWidget.ID,
        createWidget: () => ctx.container.get<SmartclideServiceCreationTheiaWidget>(SmartclideServiceCreationTheiaWidget)
    })).inSingletonScope();
});
