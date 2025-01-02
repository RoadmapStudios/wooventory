<?php

declare(strict_types=1);

namespace CommerceBird\Dependencies\League\Container\ServiceProvider;

use CommerceBird\Dependencies\League\Container\ContainerAwareInterface;

interface ServiceProviderInterface extends ContainerAwareInterface
{
    public function getIdentifier(): string;
    public function provides(string $id): bool;
    public function register(): void;
    public function setIdentifier(string $id): ServiceProviderInterface;
}
