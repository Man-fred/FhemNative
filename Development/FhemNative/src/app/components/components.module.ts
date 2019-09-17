import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NgSelectModule } from '@ng-select/ng-select';

// Components
import { RoomComponent } from './room/room.component';
import { SettingsRoomComponent } from './room/room-settings.component';
import { GridComponent } from './grid/grid.component';
import { PickerComponent } from './picker/picker.component';
import { FhemMenuComponent } from './menu/fhem-menu.component';
import { CreateComponentComponent } from './create/create-component.component';
import { EditComponentComponent } from './create/edit-component.component';
import { CreateRoomComponent } from './create/create-room.component';
import { FhemContainerComponent } from './fhem-container/fhem-container.component';

// Fhem Components
import { FHEM_COMPONENT_REGISTRY } from './fhem-components-registry';

// Directives
import { DirectivesModule } from '../directives/directives.module';

// Services
import { CreateComponentService } from '../services/create-component.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}
@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		MatRippleModule,
		DirectivesModule,
		NgSelectModule,
		HttpClientModule,
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
	],
	declarations: [
		RoomComponent,
		SettingsRoomComponent,
		GridComponent,
		CreateComponentComponent,
		EditComponentComponent,
		CreateRoomComponent,
		FhemMenuComponent,
		PickerComponent,
		FhemContainerComponent,
		FHEM_COMPONENT_REGISTRY
	],
	exports: [
		RoomComponent,
		PickerComponent,
		SettingsRoomComponent,
		FhemMenuComponent,
		TranslateModule,
		NgSelectModule
	],
	providers: [
		CreateComponentService
	],
	entryComponents: [
		RoomComponent,
		SettingsRoomComponent,
		GridComponent,
		CreateComponentComponent,
		EditComponentComponent,
		FHEM_COMPONENT_REGISTRY
	]
})
export class ComponentsModule {}