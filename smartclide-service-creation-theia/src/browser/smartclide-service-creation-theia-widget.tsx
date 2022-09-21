/*******************************************************************************
 * Copyright (C) 2021-2022 University of Macedonia
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as React from 'react';
import { injectable, postConstruct, inject } from 'inversify';
import { AlertMessage } from '@theia/core/lib/browser/widgets/alert-message';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { messageTypes, buildMessage } from '@unparallel/smartclide-frontend-comm';
import { Message } from '@theia/core/lib/browser';

@injectable()
export class SmartclideServiceCreationTheiaWidget extends ReactWidget {

    static readonly ID = 'smartclide-service-creation-theia:widget';
    static readonly LABEL = 'Smartclide Service Creation Testing';
	static state = {
		stateBackEndHost: 'https://api.dev.smartclide.eu',
		stateGitURL: '',
		stateGitUsername: '',
		stateGitToken: '',
		stateKeycloakToken: ''
	};

	//Handle TOKEN_INFO message from parent
	handleTokenInfo = ({data}:any) => {
    switch (data.type) {
      case messageTypes.TOKEN_INFO:
        console.log("service-creation: RECEIVED", JSON.stringify(data, undefined, 4));
        SmartclideServiceCreationTheiaWidget.state.stateKeycloakToken = data.content;
        break;
      case messageTypes.TOKEN_REVOKE:
        console.log("service-creation: RECEIVED", JSON.stringify(data, undefined, 4));
        window.removeEventListener("message", this.handleTokenInfo);
        break;
      default:
        break;
    }
	}

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @postConstruct()
    protected async init(): Promise < void> {
        this.id = SmartclideServiceCreationTheiaWidget.ID;
        this.title.label = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.caption = SmartclideServiceCreationTheiaWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cogs';

        this.update();

		//Add even listener to get the Keycloak Token
		window.addEventListener("message", this.handleTokenInfo);

		//Send a message to inform SmartCLIDE IDE
		let message = buildMessage(messageTypes.COMPONENT_HELLO);
		window.parent.postMessage(message, "*");
    }

	//After Detach Remove Listener
	protected onAfterDetach(msg: Message): void {
		window.removeEventListener("message", this.handleTokenInfo);
		super.onAfterDetach(msg);
	}

    protected render(): React.ReactNode {
        const header = `Provide the Git project details.`;

		return <div id='widget-container-ServiceCreation'>
            <AlertMessage type='INFO' header={header} />
            <div id='info'>
				<table>
					<tbody>
					  <tr>
						<td className='cellID'>Git URL:</td>
						<td>
							<input onChange={this.updateInput} placeholder='URL' name='stateGitURL'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Git Username:</td>
						<td>
							<input onChange={this.updateInput} placeholder='Username' name='stateGitUsername'/>
						</td>
					  </tr>
					  <tr>
						<td className='cellID'>Git Token:</td>
						<td>
							<input type='password' onChange={this.updateInput} placeholder='Token' name='stateGitToken'/>
						</td>
					  </tr>
					</tbody>
				</table>
            </div>
			<button className='theia-button secondary' title='Create' onClick={_a => this.runprocess()}>Run</button>
			<div id='waitAnimation' className="lds-dual-ring"></div>
			<i id='message'></i>
		</div>
    }

    protected async runprocess() {
		//if all the fields have values
		if(SmartclideServiceCreationTheiaWidget.state.stateGitURL!='' &&
		   SmartclideServiceCreationTheiaWidget.state.stateGitUsername!='' && SmartclideServiceCreationTheiaWidget.state.stateGitToken!='')
		{
			//waiting animation start
			(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

			//post request
			fetch(SmartclideServiceCreationTheiaWidget.state.stateBackEndHost+'/generateTests', {
				method: 'post',
				headers: {
					'Accept': '*/*',
					'Access-Control-Allow-Origin': '*',
					'Authorization': 'Bearer ' + SmartclideServiceCreationTheiaWidget.state.stateKeycloakToken,
					'gitRepoURL' : SmartclideServiceCreationTheiaWidget.state.stateGitURL,
					'gitUsername' : SmartclideServiceCreationTheiaWidget.state.stateGitUsername,
					'gitToken' : SmartclideServiceCreationTheiaWidget.state.stateGitToken
				}
			}).then(res => res.json())
			  .then((out) => {
					var obj = JSON.parse(JSON.stringify(out));

					//waiting animation stop
					(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";

					//show message get from service
					(document.getElementById("message") as HTMLElement).style.display = "block";
					(document.getElementById('message') as HTMLElement).innerHTML = obj.message;

					//check post request status
					if (obj.status==0){
						this.messageService.info('Successful Execution');
					}
					else{
						this.messageService.info('Error In Execution');
					}
			  })
			  .catch(err => {
				(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
				console.log('err: ', err);
				(document.getElementById("message") as HTMLElement).style.display = "block";
				(document.getElementById('message') as HTMLElement).innerHTML = 'Error With Service';
			  });
		}
		else{
			(document.getElementById("message") as HTMLElement).style.display = "none";
			this.messageService.info('Provide values for all fields');
		}
    }

	//update the state
	updateInput (e: React.ChangeEvent<HTMLInputElement>) {
		const key =e.currentTarget.name as keyof typeof SmartclideServiceCreationTheiaWidget.state
		SmartclideServiceCreationTheiaWidget.state[key] = e.currentTarget.value;
    }
}
